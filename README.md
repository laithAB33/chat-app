# chat-app

| العملية | الحدث (Event) | البيانات المرسلة | البيانات المستقبلة |
|---------|---------------|------------------|-------------------|
| إرسال رسالة | sendMessage | message, receiverId | - |
| تأكيد الإرسال | messageSent | - | message, senderId, receiverId, createdAt |
| استقبال رسالة جديدة | newMessage | - | message, senderId, receiverId, createdAt |