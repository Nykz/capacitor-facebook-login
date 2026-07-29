import { Component, OnInit, signal } from '@angular/core';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logoFacebook,
  logOutOutline,
  shieldCheckmarkOutline,
  mailOutline,
  personCircleOutline,
  keyOutline,
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import {
  FacebookSignIn,
  Profile,
} from '@capawesome/capacitor-facebook-sign-in';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';

export interface UserProfile {
  name: string;
  email: string;
  photoUrl: string;
  userId: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
  ],
})
export class HomePage implements OnInit {
  isLoggedIn = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  userProfile = signal<UserProfile>({
    name: '',
    email: '',
    photoUrl: '',
    userId: '',
  });

  private readonly STORAGE_KEY = 'fb_user_profile';

  constructor() {
    addIcons({
      logoFacebook,
      logOutOutline,
      shieldCheckmarkOutline,
      mailOutline,
      personCircleOutline,
      keyOutline,
    });
  }

  async ngOnInit() {
    await this.initializePlugin();
    await this.checkCurrentSession();
  }

  private async initializePlugin() {
    try {
      await FacebookSignIn.initialize({
        appId: environment.facebook.appId,
      });
    } catch (error) {
      console.error('FacebookSignIn initialize error:', error);
    }
  }

  private async checkCurrentSession() {
    this.isLoading.set(true);
    try {
      const { value: cached } = await Preferences.get({ key: this.STORAGE_KEY });
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          this.userProfile.set(parsed);
          this.isLoggedIn.set(true);
          return;
        } catch {
          // ignore corrupted cache
        }
      }

      if (Capacitor.isNativePlatform()) {
        const { accessToken } = await FacebookSignIn.getCurrentAccessToken();
        if (accessToken) {
          this.userProfile.set(this.createDefaultProfile(accessToken.userId));
          this.isLoggedIn.set(true);
        } else {
          this.isLoggedIn.set(false);
        }
      } else {
        this.isLoggedIn.set(false);
      }
    } catch (error) {
      console.error('Error checking current session:', error);
      this.isLoggedIn.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  async fbLogin() {
    this.isLoading.set(true);
    try {
      const result = await FacebookSignIn.signIn({
        permissions: ['public_profile', 'email'],
      });

      console.log('Facebook Sign-In Result:', result);

      if (result) {
        const profile = result?.profile;
        const newProfile: UserProfile = {
          name: profile?.name || 'Facebook User',
          email: profile?.email || 'Connected via Facebook',
          photoUrl: profile?.imageUrl || '',
          userId: profile?.id || result.accessToken?.userId || '',
        };
        await Preferences.set({
          key: this.STORAGE_KEY,
          value: JSON.stringify(newProfile),
        });
        this.userProfile.set(newProfile);
        this.isLoggedIn.set(true);
      }
    } catch (error) {
      console.error('Facebook Sign-In Error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout() {
    this.isLoading.set(true);
    try {
      await FacebookSignIn.signOut();
    } catch (error) {
      console.error('Facebook Sign-Out Error:', error);
    } finally {
      await Preferences.remove({ key: this.STORAGE_KEY });
      this.isLoggedIn.set(false);
      this.userProfile.set({
        name: '',
        email: '',
        photoUrl: '',
        userId: '',
      });
      this.isLoading.set(false);
    }
  }

  clearPhotoUrl() {
    this.userProfile.update((prev) => ({ ...prev, photoUrl: '' }));
  }

  private createDefaultProfile(userId: string): UserProfile {
    return {
      name: 'Facebook User',
      email: 'Connected via Facebook',
      photoUrl: '',
      userId: userId || 'N/A',
    };
  }
}
