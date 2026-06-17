interface OneSignalNotifications {
  permission: boolean;
  requestPermission(): Promise<void>;
}

interface OneSignalUser {
  addTag(key: string, value: string): void;
  removeTag(key: string): void;
  addTags(tags: Record<string, string>): void;
}

interface OneSignalSDK {
  Notifications: OneSignalNotifications;
  User: OneSignalUser;
}

interface Window {
  OneSignal?: OneSignalSDK;
  OneSignalDeferred?: Array<(sdk: OneSignalSDK) => void | Promise<void>>;
}
