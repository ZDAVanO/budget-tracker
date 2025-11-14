import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
} from '@radix-ui/themes';
import { RocketIcon, LightningBoltIcon, BarChartIcon, CheckCircledIcon } from '@radix-ui/react-icons';


// MARK: features array
const features = [
  {
    title: 'Full budget control',
    description: 'Track income, expenses, and balances in real time with visual charts.',
    icon: <BarChartIcon />,
  },
  {
    title: 'Smart categories',
    description: 'Group transactions by category to spot trends and optimize spending.',
    icon: <LightningBoltIcon />,
  },
  {
    title: 'Flexible tools',
    description: 'Filters, reports, wallets, and more for thoughtful financial management.',
    icon: <RocketIcon />,
  },
];


// MARK: Home
function Home() {
  return (
    <>
      {/* MARK: hero section */}
      <section
        className="py-12"
        style={{
          background:
            'radial-gradient(160% 120% at 50% -20%, var(--accent-a3) 0%, transparent 55%)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col items-center gap-6 text-center">
            <Badge size="2" color="mint" variant="soft">
              Joyful financial control
            </Badge>

            <Heading as="h1" size="9">
              Budget Tracker
            </Heading>

            <Text size="5" color="gray">
              Plan expenses, achieve goals, and build financial freedom.
            </Text>

            <div className="flex gap-3 flex-wrap justify-center">
              <Button asChild size="3">
                <Link to="/register">Start for free</Link>
              </Button>

              <Button asChild variant="soft" color="gray" size="3">
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>

          </div>
        </div>

      </section>

      {/* MARK: features section */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col gap-8">
            <h2 className="text-center text-3xl font-bold">
              Everything you need for budget management
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {features.map((feature) => (
                <Card key={feature.title} size="4" variant="surface">
                  <div className="flex flex-col gap-3">

                    <div className="flex items-center gap-2">
                      {feature.icon}
                      <Heading as="h3" size="4">
                        {feature.title}
                      </Heading>
                    </div>

                    <Text color="gray">{feature.description}</Text>

                  </div>
                </Card>
              ))}

            </div>

          </div>
        </div>
      </section>

    </>
  );
}

export default Home;
