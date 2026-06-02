# chat-app

| العملية | الحدث (Event) | البيانات المرسلة | البيانات المستقبلة |
|---------|---------------|------------------|-------------------|
| إرسال رسالة | sendMessage | message, receiverUserName | - |
| تأكيد الإرسال | messageSent | - | message, senderUserName, receiverUserName createdAt |
| استقبال رسالة جديدة | newMessage | - | message, senderUserName, receiverUserName, createdAt |