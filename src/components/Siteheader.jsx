import { Group, Title } from '@mantine/core';
import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoonStars, IconArrowNarrowLeft } from '@tabler/icons-react';

export default function Siteheader() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  return (
    <Group position="apart">
      <ActionIcon
        size="lg"
        variant="outline"
        color={dark ? 'yellow' : 'blue'}
        title="Back to garden"
        component="a"
        href="https://galbadia.garden"
      >
        <IconArrowNarrowLeft size="1.1rem" />
      </ActionIcon>
      <Title order={1}>FF8 Speedrun API</Title>
      <ActionIcon
        size="lg"
        variant="outline"
        color={dark ? 'yellow' : 'blue'}
        onClick={() => toggleColorScheme()}
        title="Toggle color scheme"
      >
        {dark ? <IconSun size="1.1rem" /> : <IconMoonStars size="1.1rem" />}
      </ActionIcon>
    </Group>
  );
}