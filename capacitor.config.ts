import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.hospital.hmapp',
    appName: 'HM App',
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
        androidScheme: 'https',
        // Allow cleartext traffic for local development
        cleartext: true
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#4F46E5',
            showSpinner: false
        }
    }
};

export default config;
