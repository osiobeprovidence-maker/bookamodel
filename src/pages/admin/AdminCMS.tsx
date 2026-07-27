import React, { useState } from 'react';
import { adminCMS, homepageTestimonials, homepageFAQ } from '../../data/adminData';
import { useToast } from '../../components/ui/Toast';

const tabs = ['Homepage Hero', 'Testimonials', 'Popular Categories', 'FAQ', 'About Page', 'Footer'];

export default function AdminCMS() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Homepage Hero');
  const [localCMS, setLocalCMS] = useState(adminCMS);
  const [localTestimonials, setLocalTestimonials] = useState(homepageTestimonials);
  const [localFAQ, setLocalFAQ] = useState(homepageFAQ);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleSave = () => {
    showToast('Changes saved successfully', 'success');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Homepage Hero' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Homepage Hero</h2>
          <div className="bg-white rounded-lg p-6 border space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input
                type="text"
                value={localCMS.heroTitle}
                onChange={(e) => setLocalCMS({ ...localCMS, heroTitle: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
              <input
                type="text"
                value={localCMS.heroSubtitle}
                onChange={(e) => setLocalCMS({ ...localCMS, heroSubtitle: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => showToast('Preview updated', 'success')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Preview
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Testimonials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Testimonials</h2>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowFormModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Testimonial
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localTestimonials.map((t: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-4 border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {t.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                    <p className="text-sm text-gray-700 mt-2 italic">"{t.quote}"</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setEditingItem({ ...t, index: idx });
                      setShowFormModal(true);
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setLocalTestimonials(localTestimonials.filter((_: any, i: number) => i !== idx));
                      showToast('Testimonial deleted', 'success');
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Popular Categories' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Popular Categories</h2>
          <p className="text-sm text-gray-500">Toggle which categories appear on the homepage.</p>
          <div className="bg-white rounded-lg p-6 border space-y-3">
            {['Photography', 'Videography', 'DJ', 'Catering', 'Florist', 'Event Planning'].map((cat) => (
              <div key={cat} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm font-medium">{cat}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save
          </button>
        </div>
      )}

      {activeTab === 'FAQ' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">FAQ</h2>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowFormModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add FAQ
            </button>
          </div>
          <div className="space-y-3">
            {localFAQ.map((item: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4">
                  <p className="font-medium text-sm">{item.question}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.answer}</p>
                </div>
                <div className="px-4 pb-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingItem({ ...item, index: idx });
                      setShowFormModal(true);
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setLocalFAQ(localFAQ.filter((_: any, i: number) => i !== idx));
                      showToast('FAQ deleted', 'success');
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'About Page' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">About Page</h2>
          <div className="bg-white rounded-lg p-6 border">
            <textarea
              value={localCMS.aboutContent || ''}
              onChange={(e) => setLocalCMS({ ...localCMS, aboutContent: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 h-48 resize-y"
              placeholder="About page content..."
            />
            <button onClick={handleSave} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Footer' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Footer</h2>
          <div className="bg-white rounded-lg p-6 border space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
              <input
                type="text"
                value={localCMS.footerCopyright || ''}
                onChange={(e) => setLocalCMS({ ...localCMS, footerCopyright: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input
                type="text"
                value={localCMS.socialInstagram || ''}
                onChange={(e) => setLocalCMS({ ...localCMS, socialInstagram: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
              <input
                type="text"
                value={localCMS.socialTwitter || ''}
                onChange={(e) => setLocalCMS({ ...localCMS, socialTwitter: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input
                type="text"
                value={localCMS.socialFacebook || ''}
                onChange={(e) => setLocalCMS({ ...localCMS, socialFacebook: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Footer Links</label>
              {(localCMS.footerLinks || []).map((link: any, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const links = [...(localCMS.footerLinks || [])];
                      links[idx] = { ...links[idx], label: e.target.value };
                      setLocalCMS({ ...localCMS, footerLinks: links });
                    }}
                    placeholder="Label"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const links = [...(localCMS.footerLinks || [])];
                      links[idx] = { ...links[idx], url: e.target.value };
                      setLocalCMS({ ...localCMS, footerLinks: links });
                    }}
                    placeholder="URL"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>
      )}

      {showFormModal && activeTab === 'Testimonials' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
            </h3>
            <TestimonialForm
              initial={editingItem}
              onSave={(data) => {
                if (editingItem !== null) {
                  const updated = [...localTestimonials];
                  updated[editingItem.index] = data;
                  setLocalTestimonials(updated);
                } else {
                  setLocalTestimonials([...localTestimonials, data]);
                }
                setShowFormModal(false);
                showToast(editingItem ? 'Testimonial updated' : 'Testimonial added', 'success');
              }}
              onCancel={() => setShowFormModal(false)}
            />
          </div>
        </div>
      )}

      {showFormModal && activeTab === 'FAQ' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit FAQ' : 'Add FAQ'}
            </h3>
            <FAQForm
              initial={editingItem}
              onSave={(data) => {
                if (editingItem !== null) {
                  const updated = [...localFAQ];
                  updated[editingItem.index] = data;
                  setLocalFAQ(updated);
                } else {
                  setLocalFAQ([...localFAQ, data]);
                }
                setShowFormModal(false);
                showToast(editingItem ? 'FAQ updated' : 'FAQ added', 'success');
              }}
              onCancel={() => setShowFormModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TestimonialForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [role, setRole] = useState(initial?.role || '');
  const [quote, setQuote] = useState(initial?.quote || '');

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
        <textarea value={quote} onChange={(e) => setQuote(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-24" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => onSave({ name, role, quote })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function FAQForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState(initial?.question || '');
  const [answer, setAnswer] = useState(initial?.answer || '');

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-24" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => onSave({ question, answer })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
