
'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';

interface Rule {
  id: number;
  name: string;
  keywords: string;
  est_time: number;
  difficulty: number;
}

export default function SettingsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    est_time: 15,
    difficulty: 1
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const res = await fetch('/api/admin/settings/rules');
    const data = await res.json();
    if (data.success) setRules(data.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { ...formData, id: editingId } : formData;

    await fetch('/api/admin/settings/rules', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    setFormData({ name: '', keywords: '', est_time: 15, difficulty: 1 });
    setEditingId(null);
    fetchRules();
  };

  const handleEdit = (rule: Rule) => {
    setFormData({
      name: rule.name,
      keywords: rule.keywords,
      est_time: rule.est_time,
      difficulty: rule.difficulty
    });
    setEditingId(rule.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/admin/settings/rules?id=${id}`, { method: 'DELETE' });
    fetchRules();
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <DashboardHeader onSearch={() => {}} />
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">تنظیمات دسته‌بندی و زمان‌بندی</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'ویرایش قانون' : 'افزودن قانون جدید'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام دسته‌بندی</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: فورتنایت"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">کلمات کلیدی (با کاما)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="vbucks, fortnite, بتل پس"
                />
                <p className="text-xs text-gray-500 mt-1">برای دسته عمومی خالی بگذارید</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">زمان (دقیقه)</label>
                  <input
                    type="number"
                    value={formData.est_time}
                    onChange={e => setFormData({ ...formData, est_time: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سختی (۱-۵)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? 'ذخیره تغییرات' : 'افزودن'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ name: '', keywords: '', est_time: 15, difficulty: 1 });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    انصراف
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">لیست قوانین موجود</h2>
            {loading ? (
              <p>در حال بارگذاری...</p>
            ) : rules.length === 0 ? (
              <p className="text-gray-500">هیچ قانونی تعریف نشده است.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="p-3 rounded-r-lg">نام</th>
                      <th className="p-3">کلمات کلیدی</th>
                      <th className="p-3">زمان</th>
                      <th className="p-3">سختی</th>
                      <th className="p-3 rounded-l-lg">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rules.map(rule => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{rule.name}</td>
                        <td className="p-3 text-sm text-gray-600 max-w-xs truncate" title={rule.keywords}>
                          {rule.keywords}
                        </td>
                        <td className="p-3">{rule.est_time} دقیقه</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            rule.difficulty >= 4 ? 'bg-red-100 text-red-700' :
                            rule.difficulty >= 3 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            سطح {rule.difficulty}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
