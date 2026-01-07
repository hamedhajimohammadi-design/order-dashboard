'use client';
import { useState, useEffect } from 'react';
import { Users, Save, Plus } from 'lucide-react';

export default function AffiliateManager() {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newPercent, setNewPercent] = useState('');

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const res = await fetch('/api/finance/affiliates');
      const data = await res.json();
      if (data.success) setAffiliates(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newCode || !newPercent) return;

    try {
      const res = await fetch('/api/finance/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          owner_name: newOwner,
          commission_percent: newPercent
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewCode('');
        setNewOwner('');
        setNewPercent('');
        fetchAffiliates();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full">
      <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-600" />
        مدیریت پورسانت افیلیت‌ها
      </h3>

      <form onSubmit={handleSave} className="mb-6 bg-gray-50 p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="کد افیلیت"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <input
            type="text"
            placeholder="نام صاحب کد"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="درصد"
              value={newPercent}
              onChange={(e) => setNewPercent(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
            <span className="text-gray-500">%</span>
          </div>
        </div>
        <button type="submit" className="w-full bg-purple-600 text-white rounded-lg py-2 text-sm font-bold hover:bg-purple-700 flex items-center justify-center gap-2">
          <Plus size={16} />
          افزودن / بروزرسانی
        </button>
      </form>

      <div className="overflow-y-auto max-h-[300px]">
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="pb-2 text-right">کد</th>
              <th className="pb-2 text-right">صاحب</th>
              <th className="pb-2 text-left">درصد</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {affiliates.map((aff) => (
              <tr key={aff.id}>
                <td className="py-3 font-mono font-bold text-gray-700">{aff.code}</td>
                <td className="py-3 text-gray-600">{aff.owner_name || '-'}</td>
                <td className="py-3 text-left font-bold text-purple-600">{aff.commission_percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
