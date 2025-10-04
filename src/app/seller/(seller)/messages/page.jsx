// seller/(seller)/messages/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { 
  FiSearch,
  FiSend,
  FiPaperclip,
  FiMoreVertical
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
 
export default function SellerMessages() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      // Mock conversations data
      const mockConversations = [
        {
          id: '1',
          customer: {
            name: 'John Doe',
            avatar: null,
            lastSeen: '2025-09-30T10:00:00Z'
          },
          lastMessage: {
            content: 'When will my order be shipped?',
            timestamp: '2025-09-30T09:45:00Z',
            sender: 'customer'
          },
          unreadCount: 2,
          messages: [
            {
              id: 'm1',
              content: 'Hello, I have a question about my recent order.',
              timestamp: '2025-09-30T09:30:00Z',
              sender: 'customer'
            },
            {
              id: 'm2',
              content: 'When will my order be shipped?',
              timestamp: '2025-09-30T09:45:00Z',
              sender: 'customer'
            }
          ]
        },
        {
          id: '2',
          customer: {
            name: 'Jane Smith',
            avatar: null,
            lastSeen: '2025-09-29T18:30:00Z'
          },
          lastMessage: {
            content: 'Thank you for the quick response!',
            timestamp: '2025-09-29T16:20:00Z',
            sender: 'customer'
          },
          unreadCount: 0,
          messages: [
            {
              id: 'm3',
              content: 'Is this product available in blue color?',
              timestamp: '2025-09-29T15:30:00Z',
              sender: 'customer'
            },
            {
              id: 'm4',
              content: 'Yes, we have it available in blue. Would you like me to update your order?',
              timestamp: '2025-09-29T16:00:00Z',
              sender: 'seller'
            },
            {
              id: 'm5',
              content: 'Thank you for the quick response!',
              timestamp: '2025-09-29T16:20:00Z',
              sender: 'customer'
            }
          ]
        }
      ]
      setConversations(mockConversations)
      setSelectedConversation(mockConversations[0])
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message = {
      id: `m${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toISOString(),
      sender: 'seller'
    }

    setSelectedConversation(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))

    setNewMessage('')
  }

  if (loading) {
    return <div className="p-6">Loading messages...</div>
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-medium text-sm">
                    {conversation.customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.customer.name}
                    </h3>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(conversation.lastMessage.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {selectedConversation.customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{selectedConversation.customer.name}</h3>
                <p className="text-xs text-gray-500">
                  Last seen {new Date(selectedConversation.customer.lastSeen).toLocaleString()}
                </p>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <FiMoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'seller'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'seller' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <FiPaperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSendMessage} className="flex items-center space-x-1">
                <FiSend className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  )
}
