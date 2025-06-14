'use client';

import { useOAuth } from '@/features/oAuth/hooks';
import { Button } from '@/shared/components/ui/button';

import { GitHubIcon } from '../../../shared/components/GitHubIcon';
import { GoogleIcon } from '../../../shared/components/GoogleIcon';
import { YandexIcon } from '../../../shared/components/YandexIcon';

export const AuthIcons = () => {
  const { handleSocialLogin } = useOAuth();

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('google')}>
        <GoogleIcon />
        Google
      </Button>
      <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('yandex')}>
        <YandexIcon />
        Яндекс
      </Button>
      <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('github')}>
        <GitHubIcon />
        GitHub
      </Button>
    </div>
  );
};
