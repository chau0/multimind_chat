import { format } from "date-fns";
import type { Message, Agent } from "@/types";
import { getAvatarEmoji } from "@/utils/avatarMapping";

interface MessageBubbleProps {
  message: Message;
  agent?: Agent;
}

export function MessageBubble({ message, agent }: MessageBubbleProps) {
  const timestamp = format(new Date(message.timestamp), "h:mm a");

  if (message.isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl shadow-sm p-4 max-w-md lg:max-w-2xl">
          <div className="flex items-center justify-end space-x-2 mb-2">
            <span className="text-xs text-blue-100">{timestamp}</span>
            <span className="text-sm font-semibold">You</span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <div className={`w-10 h-10 bg-gradient-to-br ${agent?.color || 'from-gray-500 to-gray-600'} rounded-full flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-sm font-semibold">{getAvatarEmoji(agent?.avatar)}</span>
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-sm p-4 max-w-md lg:max-w-2xl">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm font-semibold text-gray-900">{agent?.display_name || 'Unknown'}</span>
            {agent && agent.description && (
              <span className={`px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full`}>
                {agent.description.split(' ')[0]}
              </span>
            )}
            <span className="text-xs text-gray-500">{timestamp}</span>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
