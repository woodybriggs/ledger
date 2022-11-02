import '@src/styles/globals.css'
import type { AppProps } from 'next/app'
import { AppShell, Burger, Header, MantineProvider, MediaQuery, Navbar, NavLink } from '@mantine/core';
import Link from 'next/link';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IconBook, IconBuildingWarehouse, IconCashBanknote, IconReceipt, IconScale, IconSettings, IconUsers } from '@tabler/icons';
import { GetServerSideProps } from 'next';


const linksData: {
  icon?: React.ReactNode,
  label: string,
  href: string
}[] = [
  { label: 'Trial Balance', href: '/app/trial-balance', icon: <IconScale/> },
  { label: 'Banking', href: '/app/banking', icon: <IconCashBanknote/> },
  { label: 'Chart of Accounts', href: '/app/accounts', icon: <IconBook/> },
  { label: 'Transactions', href: '/app/transactions', icon: <IconReceipt/> },
  { label: 'Suppliers', href: '/app/suppliers', icon: <IconBuildingWarehouse/> },
  { label: 'Customers', href: '/app/customers', icon: <IconUsers/> },
  { label: 'Settings', href: '/app/settings', icon: <IconSettings/> },
]

const SideNavigation: React.FC<{
  opened: boolean,
  pathname: string
}> =({
  opened,
  pathname
}) => {
  const links = linksData.map((link, i) => (
    <Link href={link.href} key={i}>
      <NavLink label={link.label} active={pathname === link.href} icon={link.icon}/>
    </Link>
  ))

  return (
    <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{sm: 200, lg: 300}}>
      <Navbar.Section grow>
        <div>
          {links}
        </div>
      </Navbar.Section>
    </Navbar>
  )
}



function MyApp({ Component, pageProps, pathname }: AppProps & { pathname: string }) {

  const queryClient = new QueryClient()

  //const [opened, setOpened] = useState(false)
  const opened = false
  const setOpened = (opened: boolean) => {}


  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme: 'light',
          }}
        >
          <AppShell
            navbar={<SideNavigation opened={opened} pathname={pathname}/>}
            header={
              <Header height={60} p="xs">
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                    <Burger
                      opened={opened}
                      //onClick={() => setOpened((o) => !o)}
                      size="sm"
                      color="gray"
                      mr="xl"
                    />
                  </MediaQuery>
                </div>
              </Header>
            }
          >
            <Component {...pageProps} />
          </AppShell>
        </MantineProvider>
      </QueryClientProvider>
    </Suspense>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {

  const url = context.req.url
  const { pathname } = new URL(url!)

  return ({
    props: {
      pathname
    }
  })
}

export default MyApp
