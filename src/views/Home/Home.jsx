"use client";

import { Typography, Row, Col, Card, Statistic, Timeline, Tag, Flex } from "antd";

const { Title, Paragraph } = Typography;

// Example data only - replace with real content.
const EXAMPLE_STATS = [
  { title: "Example stat A", value: 12 },
  { title: "Example stat B", value: 3 },
  { title: "Example stat C", value: 98, suffix: "%" },
];

const EXAMPLE_ACTIVITY = [
  { content: "Example item one" },
  { content: "Example item two" },
  { content: "Example item three" },
];

export default function Home() {
  return (
    <Flex vertical gap="large">
      <div>
        <Title level={2}>Home</Title>
        <Paragraph type="secondary">
          Example content built with Ant Design components. Replace it with
          the real home page.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {EXAMPLE_STATS.map((stat) => (
          <Col key={stat.title} xs={24} sm={8}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Example activity" extra={<Tag color="orange">Example</Tag>}>
        <Timeline items={EXAMPLE_ACTIVITY} />
      </Card>
    </Flex>
  );
}
