

export async function findChatHistoryByRoom(db, tokenContractAddress) {
  return db.collection('chathistories').find({
    room: tokenContractAddress
  }).toArray();
}
