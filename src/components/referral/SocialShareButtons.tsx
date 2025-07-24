'use client';

import { Copy, ExternalLink, Facebook, Instagram, Mail, MessageCircle, Twitter } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type SocialShareButtonsProps = {
  referralLink: string;
  referralCode: string;
};

const SHARE_MESSAGE = 'Join Rolitt with my referral link and get a discount on your AI companion purchase! 🤖✨';

export default function SocialShareButtons({ referralLink, referralCode }: SocialShareButtonsProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(SHARE_MESSAGE);
    const url = encodeURIComponent(referralLink);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(referralLink);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(fbUrl, '_blank', 'width=550,height=420');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${SHARE_MESSAGE} ${referralLink}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join Rolitt with my referral link!');
    const body = encodeURIComponent(`${SHARE_MESSAGE}\n\nUse my referral link: ${referralLink}\n\nReferral code: ${referralCode}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl);
  };

  const useNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Rolitt with my referral link!',
          text: SHARE_MESSAGE,
          url: referralLink,
        });
      } catch (error) {
        // User cancelled the share, ignore error
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={copyToClipboard}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          {copySuccess ? 'Copied!' : 'Copy Link'}
        </Button>

        <Button
          onClick={useNativeShare}
          size="sm"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <ExternalLink className="h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Social Platform Buttons */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Share on social platforms:</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Twitter */}
          <Button
            onClick={shareToTwitter}
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20"
          >
            <Twitter className="h-4 w-4 text-blue-500" />
            <span className="hidden sm:inline">Twitter</span>
          </Button>

          {/* Facebook */}
          <Button
            onClick={shareToFacebook}
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20"
          >
            <Facebook className="h-4 w-4 text-blue-600" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>

          {/* WhatsApp */}
          <Button
            onClick={shareToWhatsApp}
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-2 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/20"
          >
            <MessageCircle className="h-4 w-4 text-green-500" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>

          {/* Email */}
          <Button
            onClick={shareViaEmail}
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-950/20"
          >
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="hidden sm:inline">Email</span>
          </Button>
        </div>

        {/* Instagram Note */}
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-lg border border-pink-200/50 dark:border-pink-800/50">
          <Instagram className="h-4 w-4 text-pink-500" />
          <div className="text-sm">
            <p className="font-medium text-pink-700 dark:text-pink-300">Instagram Stories</p>
            <p className="text-pink-600 dark:text-pink-400 text-xs">Copy link and paste in your story manually</p>
          </div>
        </div>
      </div>

      {/* Sharing Tips */}
      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Sharing Tips</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Share with friends and family who might be interested in AI companions</li>
          <li>• Post in relevant communities and social groups</li>
          <li>• Add a personal message about why you love Rolitt</li>
          <li>
            • Your referral code:
            <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded text-xs">{referralCode}</code>
          </li>
        </ul>
      </div>
    </div>
  );
}
