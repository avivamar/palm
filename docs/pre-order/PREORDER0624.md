预购流程进行了深度检查和重构。

主要改动如下：

1. 引入了 Preorder Action ( preorderActions.ts ) : 创建了一个新的 server action 用于处理预购流程的后端逻辑，例如在 Firestore 中创建预购记录和发送事件到 Klaviyo。
2. 优化了前端组件 ( ProductSelection.tsx ) : 当用户输入邮箱并选择产品颜色后，会立即调用 initiatePreorder action，提前在后端创建一条预购记录，并获取一个 preorderId 。
3. 简化了支付流程 ( PaymentButton.tsx 和 paymentActions.ts ) : preorderId 会被传递到支付环节，并最终附加到 Stripe Checkout Session 的元数据中。这样，我们就可以在 webhook 中通过 preorder_id 精确地找到并更新对应的预购记录。
4. 重构了 Stripe Webhook ( stripe/route.ts ) :
   - 现在 webhook 会根据 checkout.session.completed 事件中的 preorder_id 来更新 Firestore 中已存在的预购记录，而不是每次都创建新的记录。这确保了数据的一致性。
   - 移除了对 payment_intent.created 事件的处理，因为它在新的流程中是多余的。
   - 更新了 payment_intent.succeeded 的处理逻辑，使其也通过 preorder_id 来更新记录。
5. 追踪用户行为 :
   - 当预购被初始化时（用户填写信息后），会触发 Rolitt Preorder Started Klaviyo 事件。
   - 当支付成功后，会触发 Rolitt Preorder Success Klaviyo 事件。
6. 代码清理 : 删除了不再需要的 create-intent API 路由，使代码库更加整洁。
