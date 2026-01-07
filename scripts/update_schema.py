import os

path = 'prisma/schema.prisma'
with open(path, 'r') as f:
    content = f.read()

old_block = """model ChatSession {
  goftino_id     String   @id
  user_phone     String?
  user           User?    @relation(fields: [user_phone], references: [phone_number])
  current_order  String?
  context_data   Json?
  status         String   @default("IDLE")
  last_activity  DateTime @default(now())
  @@map("chat_sessions")
}"""

new_block = """model ChatSession {
  id             Int           @id @default(autoincrement())
  platform       String        // "telegram", "goftino"
  external_id    String        // chat_id or goftino_session_id
  user_id        Int?
  user           User?         @relation(fields: [user_id], references: [id])
  status         String        @default("active") // "active", "closed"
  last_message_at DateTime     @default(now())
  created_at     DateTime      @default(now())
  updated_at     DateTime      @updatedAt
  messages       ChatMessage[]

  @@unique([platform, external_id])
  @@index([user_id])
  @@map("chat_sessions")
}

model ChatMessage {
  id              Int         @id @default(autoincrement())
  session_id      Int
  session         ChatSession @relation(fields: [session_id], references: [id], onDelete: Cascade)
  sender          String      // "user", "admin", "system"
  content         String      @db.Text
  is_read         Boolean     @default(false)
  created_at      DateTime    @default(now())
  
  @@index([session_id])
  @@map("chat_messages")
}"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open(path, 'w') as f:
        f.write(new_content)
    print("Schema updated successfully.")
else:
    print("Old block not found!")
    # Debug: print partial content
    print("Content preview near 'model ChatSession':")
    import re
    m = re.search(r'model ChatSession', content)
    if m:
        print(content[m.start():m.start()+200])

