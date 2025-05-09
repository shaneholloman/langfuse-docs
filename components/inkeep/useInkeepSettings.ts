import type {
  InkeepAIChatSettings,
  InkeepSearchSettings,
  InkeepBaseSettings,
  InkeepModalSettings,
  AIChatDisclaimerSettings,
  InvokeCallbackAction,
  InkeepCallbackEvent,
} from "@inkeep/cxkit-react";
import { useTheme } from "nextra-theme-docs";
import { showChat } from "../supportChat";
import { type PostHog, usePostHog } from "posthog-js/react";

const customAnalyticsCallback = (
  event: InkeepCallbackEvent,
  posthog: PostHog
): void => {
  const { componentType, conversation } = event.properties;
  const messages = conversation?.messages || [];
  posthog.capture(`inkeep:${event.eventName}`, {
    interactionType: componentType,
    content:
      event.eventName === "user_message_submitted"
        ? messages[messages.length - 1]?.content
        : undefined,
  });
};

type InkeepSharedSettings = {
  baseSettings: InkeepBaseSettings;
  aiChatSettings: InkeepAIChatSettings;
  searchSettings: InkeepSearchSettings;
  modalSettings: InkeepModalSettings;
};

const useInkeepSettings = (): InkeepSharedSettings => {
  const { resolvedTheme } = useTheme();
  const posthog = usePostHog();

  const baseSettings: InkeepBaseSettings = {
    apiKey: process.env.NEXT_PUBLIC_INKEEP_API_KEY! || "",
    primaryBrandColor: "#E11312", // your brand color, widget color scheme is derived from this
    organizationDisplayName: "Langfuse",
    // ...optional settings
    colorMode: {
      forcedColorMode: resolvedTheme, // to sync dark mode with the widget
    },
    onEvent: (event) => customAnalyticsCallback(event, posthog),
  };

  const modalSettings: InkeepModalSettings = {
    // optional settings

    // deactivate by default, only activated for search bar
    shortcutKey: null,
  };

  const searchSettings: InkeepSearchSettings = {
    placeholder: "Search...",
  };

  const disclaimerSettings: AIChatDisclaimerSettings = {
    isEnabled: true,
    label: "AI-generated response",
    tooltip:
      "This response is generated by AI and may contain inaccuracies or errors. Please reach out to support if you need assistance.",
  };

  const contactSupportCallToAction: InvokeCallbackAction = {
    type: "invoke_callback",
    callback: () => {
      showChat();
      // if (!args.conversation?.messages?.length) {
      //   showChat();
      //   return;
      // }

      // const draftMessage =
      //   "I tried to get answers via the AI chat but was unable to. My questions were:\n\n" +
      //   args.conversation.messages
      //     .filter((message) => message.role === "user")
      //     .map((message) => message.content)
      //     .join("\n");

      // openChat(draftMessage);
    },
    shouldCloseModal: false,
  };

  const aiChatSettings: InkeepAIChatSettings = {
    // optional settings
    chatSubjectName: "Langfuse",
    aiAssistantAvatar: "/icon256.png", // use your own bot avatar
    introMessage:
      "Hi! I'm Langfuse's AI assistant trained on documentation, help articles, and other content. How can I help you today?",
    isCopyChatButtonVisible: true,
    disclaimerSettings,
    isShareButtonVisible: true,
    shareChatUrlBasePath: "https://langfuse.com/docs/ask-ai",
    getHelpOptions: [
      {
        name: "Contact Support",
        action: contactSupportCallToAction,
        icon: {
          builtIn: "IoChatbubblesOutline",
        },
      },
    ],
    exampleQuestions: [
      "How can Langfuse help me?",
      "How to use the Python decorator for tracing?",
      "How to set up LLM-as-a-judge evals?",
    ],
  };

  return { baseSettings, aiChatSettings, searchSettings, modalSettings };
};

export default useInkeepSettings;
