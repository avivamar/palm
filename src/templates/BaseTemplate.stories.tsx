import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { NextIntlClientProvider } from 'next-intl';
import { BaseTemplate } from './BaseTemplate';

// 创建一个简单的模拟翻译对象，只包含 BaseTemplate 需要的翻译
const messages = {
  BaseTemplate: {
    description: 'Pre-order your Rolitt AI Companion today and join the next generation of interactive technology.',
    made_with: 'Made with <author>Rolitt</author>.',
  },
};

const meta = {
  title: 'Example/BaseTemplate',
  component: BaseTemplate,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof BaseTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BaseWithReactComponent = {
  args: {
    children: <div>Children node</div>,
    leftNav: (
      <>
        <li>Link 1</li>
        <li>Link 2</li>
      </>
    ),
  },
} satisfies Story;

export const BaseWithString = {
  args: {
    children: 'String',
    leftNav: (
      <>
        <li>Link 1</li>
        <li>Link 2</li>
      </>
    ),
  },
} satisfies Story;

// More on interaction testing: https://storybook.js.org/docs/7.0/react/writing-tests/interaction-testing
export const BaseWithHomeLink: Story = {
  args: {
    children: <div>Children node</div>,
    leftNav: (
      <>
        <li>Link 1</li>
        <li>Link 2</li>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByText('Link 1');

    await userEvent.click(link);
  },
} satisfies Story;
