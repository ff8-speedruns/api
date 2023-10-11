import Siteheader from '../components/Siteheader';
import { Alert, AppShell, Code, Header, Text, Title, Table, Box } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function Root() {

  const serv = `https://ff8-api.onrender.com/`;

  const endpoints = [
    {
      url: `${serv}poles/:pattern`,
      description: `Returns caraway code given the pole counts. Accepts spaces, slashes, and dashes as separators.`,
      example: [`!poles [pattern]`, `!poles 5 8 12 ?`, `!poles 7-7-12`],
      endpoint: `${serv}poles/`
    },
    {
      url: `${serv}party/:system :pattern :holywar`,
      description: `Returns final party draws given Squall's movements in the time compression FMV. Accepts wasd, 2468.`,
      example: [`!party [PSX/PSJP/PC] [Pattern] [HW if you have holy war]`, `!party pc wswwdswasasw`, `!party psx 828862842428 hw`],
      endpoint: `${serv}party/`
    },
  ];

  const rows = endpoints.map((element) => (
    <tr key={element.url}>
      <td>{element.url}</td>
      <td>{element.description}</td>
      <td>{element.example.map((ex) => (<span key={ex}><Code block>{ex}</Code><br /></span>))}</td>
      <td>
        StreamElements:<br /><Code block>{`\${customapi.${element.endpoint}\${pathescape \${1:}}}`}</Code><br />
        StreamLabs:<br /><Code block>{`{readapi.${element.endpoint}{start:end}}`}</Code><br />
        Nightbot:<br /><Code block>{`$(urlfetch ${element.endpoint}$(querystring))`}</Code><br />
        Wizebot:<br /><Code block>{`$urlcall(${element.endpoint}$(message_clear_encoded))`}</Code>
      </td>
    </tr>
  ));

  return (
    <AppShell
      padding="md"
      header={<Header height={60} p="xs"><Siteheader /></Header>}
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
      })}
    >
      <Box my="lg">
        <Title order={2}>How to use this service:</Title>
        <Text fz="sm">In most of the Twitch chat bots available online, you are able to define a custom command that calls a remote API. Examples of some of the popular ones are included in the table below. Simply create a custom command in your bot for whichever endpoint you wish to include in your stream using the appropriate format and off you go!</Text>
      </Box>
      <Box my="lg">
        <Title order={2}>Available Endpoints:</Title>
        <Alert icon={<IconAlertCircle size="1rem" />} title="Latency Warning" color="orange" variant="filled" my="sm">
          Since the API is hosted on a free service, it may take up to 5 seconds to respond to your chat command. This should, however, be fine considering that these manipulations are usually performed well in advance of when they are needed.
          <br /><br />
          The (free) server spins down after 5 minutes of inactivity, so <strong>it is almost guaranteed that the first command you send per stream will fail</strong>, as it will likely time out when you send the first command while it spins back up. Just re-send the command after a few seconds to try again.
        </Alert>
        <Table verticalSpacing="lg" striped highlightOnHover withColumnBorders>
          <thead>
            <tr>
              <th>Generic URL</th>
              <th>Description</th>
              <th>Example Usage</th>
              <th>Example Command Configuration</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Box>

    </AppShell>
  );
}