import { Account, AccountClosure, PrismaClient } from "@prisma/client";

type Node<T> = T & { children: Node<T>[] }

export class ClosureTableRepository {

  constructor(
    private prismaClient: PrismaClient,
    private modelName: string,
    private parentRefColumnName: string,
    private childRefColumnName: string,
    private depthColumnName: string = "depth",
  ) {}

  public async insertSelfRef (id: string) {
    await this.prismaClient.$executeRawUnsafe(`
      INSERT INTO [${this.modelName}] (${this.parentRefColumnName}, ${this.childRefColumnName}, ${this.depthColumnName})
      SELECT "${id}" as ${this.parentRefColumnName}, "${id}" as ${this.childRefColumnName}, 0 as ${this.depthColumnName};
    `)
  }

  public async insertChild(parentId: string, childId: string) {
    await this.prismaClient.$executeRawUnsafe(`
      INSERT INTO [${this.modelName}](${this.parentRefColumnName}, ${this.childRefColumnName}, ${this.depthColumnName})
      SELECT p.${this.parentRefColumnName}, c.${this.childRefColumnName}, p.${this.depthColumnName}+c.${this.depthColumnName}+1
      FROM [${this.modelName}] p, [${this.modelName}] c
      WHERE p.${this.childRefColumnName}="${parentId}" and c.${this.parentRefColumnName}="${childId}"
    `)
  }

  private async getRoots () {
    const roots = await this.prismaClient.$queryRawUnsafe<(Account & AccountClosure)[]>(`
      SELECT *
      FROM "Account" a
      JOIN (
      SELECT *
      FROM "AccountClosure"
      GROUP BY childAccountId
      HAVING count(*) = 1) x on x.parentAccountId = a.accountId
    `)
    return roots
  }

  private async getChildren (node: (Account & AccountClosure), depth: number = 1): Promise<Node<(Account & AccountClosure)>> {
    const children = await this.prismaClient.$queryRawUnsafe<(Account & AccountClosure)[]>(`
    SELECT *
    FROM Account a
    JOIN AccountClosure ac on ac.childAccountId = a.accountId
    WHERE parentAccountId = "${node.accountId}" AND childAccountId != "${node.accountId}" AND depth = ${depth};`)

    if (children.length)
      return ({
        ...node,
        children: await Promise.all(children.map(async c => await this.getChildren(c, depth + 1))),
      })
    else
      return ({
        ...node,
        children: []
      })
  }

  public async constructTree(): Promise<Node<(Account & AccountClosure)>[]> {
    const roots = await this.getRoots()

    let _roots: Node<(Account & AccountClosure)>[] = [];
    for (let root of roots) {
      const r = await this.getChildren(root, 1)
      _roots.push(r)
    }

    return _roots
  }


}