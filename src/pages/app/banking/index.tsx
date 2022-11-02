import { Button, Group, Modal } from "@mantine/core";
import { BankForm } from "@src/forms/Bank.form";
import { useState } from "react";

export default function BankPage () {

  const [ bankModalOpen, setBankModalOpen ] = useState(false)

  return (
    <>
      <Group position="apart">
        <h1>Banks</h1>
        <Group>
          <Button onClick={() => setBankModalOpen(true)}>Add Bank</Button>
          <Modal
            title="Add Bank"
            centered
            opened={bankModalOpen}
            onClose={() => setBankModalOpen(false)}
          >
            <BankForm mode={'create'} onSuccessfulSave={() => setBankModalOpen(false)} />
          </Modal>
        </Group>
      </Group>

    </>
  )
}