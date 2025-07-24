// Use type safe message keys with `next-intl`
// 定义一个基本的消息类型，实际上我们使用分散的翻译文件
type Messages = {
  BaseTemplate: {
    description: string;
    made_with: string;
  };
};

// eslint-disable-next-line
declare interface IntlMessages extends Messages {}
