import request from "@/utils/request.js";

// 获取在线访客列表
export function getVisitorList(chat_type) {
  return request({
    url: `/api/chat/visitor-list?chat_type=${chat_type}`,
    method: "get",
  });
}
// 获取聊天记录
export function getChatMessages(visitor_id, last_id = 0) {
  return request({
    url: `/api/chat/pull?visitor_id=${visitor_id}&last_id=${last_id}`,
    method: "get",
  });
}

// 发送消息
export function sendChatMsg(data) {
  return request({
    url: "/api/chat/send_to_wecom_card",
    method: "post",
    data,
  });
}

// 标记已读
export function markChatRead(visitor_id) {
  return request({
    url: `/api/chat/mark-read?visitor_id=${visitor_id}`,
    method: "post",
  });
}

export function clearChatByVisitor(visitor_id) {
  return request({
    url: `/api/chat/clear-by-visitor?visitor_id=${visitor_id}`,
    method: "delete",
  });
}

export function pullVisitorList(chat_type) {
  return request({
    url: `/api/chat/visitor-poll?chat_type=${chat_type}`,
    method: "get",
  });
}

// 会话列表长轮询 
export function pollVisitorList(chat_type) {
  return request({
    url: `/api/chat/visitor-poll`,
    method: "get",
    params: { chat_type }
  });
}