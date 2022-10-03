import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AppShell, Burger, createStyles, Header, MantineProvider, MediaQuery, Navbar, NavLink } from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { IconBook, IconBuildingWarehouse, IconReceipt, IconSettings, IconUsers } from '@tabler/icons';


const useStyles = createStyles((theme) => ({
  link: {
    boxSizing: 'border-box',
    display: 'block',
    textDecoration: 'none',
    borderTopRightRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    padding: `0 ${theme.spacing.md}px`,
    fontSize: theme.fontSizes.sm,
    marginRight: theme.spacing.md,
    fontWeight: 500,
    height: 44,
    lineHeight: '44px',

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    },
  },

  linkActive: {
    '&, &:hover': {
      borderLeftColor: theme.fn.variant({ variant: 'filled', color: theme.primaryColor })
        .background,
      backgroundColor: theme.fn.variant({ variant: 'filled', color: theme.primaryColor })
        .background,
      color: theme.white,
    },
  },
}))


const linksData: {
  icon?: React.ReactNode,
  label: string,
  href: string
}[] = [
  { label: 'Chart of Accounts', href: '/accounts', icon: <IconBook/> },
  { label: 'Transactions', href: '/transactions', icon: <IconReceipt/> },
  { label: 'Suppliers', href: '/suppliers', icon: <IconBuildingWarehouse/> },
  { label: 'Customers', href: '/customers', icon: <IconUsers/> },
  { label: 'Settings', href: '/settings', icon: <IconSettings/> }
]

const SideNavigation: React.FC<{
  opened: boolean
}> =({
  opened
}) => {

  const { pathname } = useRouter();
  

  const links = linksData.map((link, i) => (
    <Link href={link.href} passHref key={i}>
      <NavLink component='a' label={link.label} active={pathname === link.href} icon={link.icon}/>
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



function MyApp({ Component, pageProps }: AppProps) {

  const queryClient = new QueryClient()

  const [opened, setOpened] = useState(false)


  return (
    <>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme: 'light',
          }}
        >
          <AppShell
            navbar={<SideNavigation opened={opened}/>}
            header={
              <Header height={60} p="xs">
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                    <Burger
                      opened={opened}
                      onClick={() => setOpened((o) => !o)}
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
    </>
  );
}

export default MyApp
