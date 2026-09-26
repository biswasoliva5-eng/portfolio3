import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, AlertCircle, ExternalLink, HelpCircle, Save, Sparkles, Key } from 'lucide-react';
import {
  getSavedCloudinaryConfig,
  saveSavedCloudinaryConfig,
  uploadToCloudinary,
  CloudinaryConfig,
} from '../../utils/cloudUploader';
import { usePortfolio } from '../../context/PortfolioContext';
import { api } from '../../api/client';

interface CloudinarySettingsCardProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CloudinarySettingsCard: React.FC<CloudinarySettingsCardProps> = ({ showToast }) => {
  const { data, refreshData } = usePortfolio();
  const settings = data?.settings;

  const [cloudName, setCloudName] = useState('');
  const [uploadPreset, setUploadPreset] = useState('');
  const [imgbbKey, setImgbbKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  useEffect(() => {
    const local = getSavedCloudinaryConfig();
    const cName = settings?.cloudinaryCloudName || local.cloudName || '';
    const uPreset = settings?.cloudinaryUploadPreset || local.uploadPreset || '';
    const ibb = settings?.imgbbApiKey || local.imgbbApiKey || '';

    setCloudName(cName);
    setUploadPreset(uPreset);
    setImgbbKey(ibb);

    if (cName && uPreset) {
      setStatus('connected');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cfg: CloudinaryConfig = {
        cloudName: cloudName.trim(),
        uploadPreset: uploadPreset.trim(),
        imgbbApiKey: imgbbKey.trim(),
      };
      saveSavedCloudinaryConfig(cfg);

      // Also persist to settings in Firestore and local db
      await api.updateSettings({
        cloudinaryCloudName: cfg.cloudName,
        cloudinaryUploadPreset: cfg.uploadPreset,
        imgbbApiKey: cfg.imgbbApiKey,
      });
      await refreshData();

      if (cfg.cloudName && cfg.uploadPreset) {
        setStatus('connected');
      } else {
        setStatus('idle');
      }
      showToast('ক্লাউড স্টোরেজ সেটিংস সফলভাবে সেভ হয়েছে', 'success');
    } catch (err: any) {
      showToast(err.message || 'সেটিংস সেভ করতে ব্যর্থ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!cloudName.trim() || !uploadPreset.trim()) {
      showToast('অনুগ্রহ করে Cloud Name এবং Upload Preset প্রদান করুন', 'error');
      return;
    }

    setTesting(true);
    try {
      // Create a tiny 1x1 test image
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 1, 1);
      }

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/png'));
      const testFile = new File([blob], 'test-connection.png', { type: 'image/png' });

      const res = await uploadToCloudinary(testFile, {
        cloudName: cloudName.trim(),
        uploadPreset: uploadPreset.trim(),
      });

      if (res.url) {
        setStatus('connected');
        showToast('সংযোগ সফল! ছবি ও ভিডিও সরাসরি ক্লাউডে সেভ হবে।', 'success');
      }
    } catch (err: any) {
      setStatus('error');
      showToast(`সংযোগ ব্যর্থ: ${err.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-neutral-950">
                Cloudinary ক্লাউড স্টোরেজ (ছবি ও ভিডিও আপলোড সমাধান)
              </h3>
              {status === 'connected' ? (
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  সংযুক্ত
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">
                  কনফিগার করা হয়নি
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              GitHub Pages এ কোনো ফাইল সাইজ লিমিট বা স্টোরেজ কোটা ছাড়া আনলিমিটেড হাই-রেজুলিউশন ছবি ও ভিডিও আপলোড করার জন্য
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs text-neutral-600 hover:text-neutral-950 inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showGuide ? 'গাইড লুকান' : 'কীভাবে পাবেন?'}</span>
        </button>
      </div>

      {/* Quick Setup Guide */}
      {showGuide && (
        <div className="bg-neutral-50 border border-neutral-200 rounded p-4 text-xs space-y-2.5 leading-relaxed text-neutral-700">
          <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>২ মিনিটে ফ্রি ক্লাউডিনারি অ্যাকাউন্ট সেটআপ:</span>
          </div>
          <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-neutral-600">
            <li>
              <a
                href="https://cloudinary.com/users/register_free"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-medium inline-flex items-center gap-0.5"
              >
                cloudinary.com এ ফ্রি অ্যাকাউন্ট খুলুন <ExternalLink className="w-2.5 h-2.5" />
              </a>{' '}
              (প্রতিমাসে ২৫ জিবি ফ্রি ব্যান্ডউইথ)।
            </li>
            <li>
              লগইন করার পর আপনার <strong>Cloud name</strong> টি কপি করে নিচের ফিল্ডে বসান।
            </li>
            <li>
              Cloudinary ড্যাশবোর্ডে গিয়ে নিচে বাঁদিকের <strong>Settings (গিয়ার আইকন)</strong> এ ক্লিক করুন &gt; <strong>Upload</strong> ট্যাবে যান।
            </li>
            <li>
              নিচে স্ক্রল করে <strong>Upload presets</strong> সেকশনে <strong>Add upload preset</strong> এ ক্লিক করুন।
            </li>
            <li>
              <strong>Signing Mode</strong> অপশনটিকে <em>Signed</em> এর বদলে <strong>Unsigned</strong> সিলেক্ট করে সেভ করুন।
            </li>
            <li>তৈরি হওয়া Preset Name টি কপি করে নিচের <strong>Upload Preset</strong> ফিল্ডে বসিয়ে সেভ করুন।</li>
          </ol>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-700 font-medium mb-1">
              Cloudinary Cloud Name
            </label>
            <input
              type="text"
              value={cloudName}
              onChange={e => setCloudName(e.target.value)}
              placeholder="e.g. dxyz123abc"
              className="w-full border border-neutral-300 p-2.5 rounded font-mono text-xs focus:outline-hidden focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-neutral-700 font-medium mb-1">
              Unsigned Upload Preset Name
            </label>
            <input
              type="text"
              value={uploadPreset}
              onChange={e => setUploadPreset(e.target.value)}
              placeholder="e.g. oliva_art_preset"
              className="w-full border border-neutral-300 p-2.5 rounded font-mono text-xs focus:outline-hidden focus:border-neutral-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-700 font-medium mb-1 text-xs">
            ImgBB API Key (ঐচ্ছিক বিকল্প)
          </label>
          <input
            type="text"
            value={imgbbKey}
            onChange={e => setImgbbKey(e.target.value)}
            placeholder="e.g. 5a1b2c3d4e5f..."
            className="w-full border border-neutral-300 p-2 rounded font-mono text-xs focus:outline-hidden focus:border-neutral-900"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !cloudName || !uploadPreset}
            className="px-3 py-1.5 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded text-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {testing ? 'টেস্ট হচ্ছে...' : 'কানেকশন টেস্ট করুন'}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-950 text-white rounded text-xs font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'সেভ হচ্ছে...' : 'ক্লাউড সেটিংস সেভ করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
