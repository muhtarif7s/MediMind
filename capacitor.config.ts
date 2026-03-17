
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartdentist.app',
  appName: 'طبيب الأسنان الذكي',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0ea5e9",
      showSpinner: true,
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
