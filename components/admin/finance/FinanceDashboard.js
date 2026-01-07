
'use client';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Calendar, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function FinanceDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('this_month'); // this_month, last_month, today, custom
  const [customRange, setCustomRange] = useState([]);
  
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [discountDetails, setDiscountDetails] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // محاسبه تاریخ‌ها
      const now = new Date();
      let start = new Date();
      let end = new Date();

      if (dateRange === 'this_month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (dateRange === 'last_month') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
      } else if (dateRange === 'today') {
        start = new Date(now.setHours(0,0,0,0));
      } else if (dateRange === 'custom' && customRange.length === 2) {
        start = customRange[0].toDate();
        end = customRange[1].toDate();
      }

      const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString()
      });

      const res = await fetch(`/api/finance/pnl?${params}`);
      const data = await res.json();
      if (data.success) setStats(data.data);
      
      // Reset discounts view when date changes
      setShowDiscounts(false);
      setDiscountDetails([]);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange !== 'custom' || customRange.length === 2) {
      fetchStats();
    }
  }, [dateRange, customRange]);

  const fetchDiscountDetails = async () => {
    if (showDiscounts) {
      setShowDiscounts(false);
      return;
    }
    
    setLoadingDiscounts(true);
    try {
      const start = stats.period.start;
      const end = stats.period.end;
      const res = await fetch(`/api/finance/discounts?start=${start}&end=${end}`);
      const data = await res.json();
      if (data.success) setDiscountDetails(data.data);
      setShowDiscounts(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const formatPrice = (n) => Math.floor(n || 0).toLocaleString();

  if (loading && !stats) return <div className="p-10 text-center">در حال محاسبه...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          داشبورد مالی
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">امروز</option>
            <option value="this_month">این ماه</option>
            <option value="last_month">ماه گذشته</option>
            <option value="custom">بازه دلخواه</option>
          </select>
          
          {dateRange === 'custom' && (
            <div className="w-48">
              <DatePicker
                range
                value={customRange}
                onChange={setCustomRange}
                calendar={persian}
                locale={persian_fa}
                placeholder="انتخاب بازه..."
                inputClass="border rounded-lg px-3 py-2 text-sm outline-none w-full text-center"
              />
            </div>
          )}

          <button onClick={fetchStats} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-bold mb-2">درآمد کل (فروش)</p>
          <p className="text-3xl font-black text-gray-800">{formatPrice(stats?.revenue)} <span className="text-sm text-gray-400">تومان</span></p>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-bold mb-2">سود ناخالص (تخمینی)</p>
          <p className="text-3xl font-black text-blue-600">{formatPrice(stats?.grossProfit)} <span className="text-sm text-gray-400">تومان</span></p>
          <p className="text-xs text-blue-400 mt-1">بر اساس مارجین دسته‌ها</p>
        </div>

        {/* Expenses */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-bold mb-2">هزینه‌های عملیاتی</p>
          <p className="text-3xl font-black text-red-500">{formatPrice(stats?.expenses)} <span className="text-sm text-gray-400">تومان</span></p>
        </div>

        {/* Net Profit */}
        <div className={`p-6 rounded-3xl border shadow-sm ${stats?.netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-gray-500 text-sm font-bold mb-2">سود خالص</p>
          <p className={`text-3xl font-black ${stats?.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatPrice(stats?.netProfit)} <span className="text-sm opacity-70">تومان</span>
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-gray-800">جزئیات کسورات</h3>
            <button 
              onClick={fetchDiscountDetails}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              {showDiscounts ? 'بستن جزئیات' : 'مشاهده ریز تخفیف‌ها'}
              {showDiscounts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">پورسانت افیلیت‌ها (هزینه)</span>
              <span className="font-mono font-bold text-red-500">{formatPrice(stats?.affiliateCommission)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">تخفیف‌های داده شده (کسر از فروش)</span>
              <span className="font-mono font-bold text-orange-500">{formatPrice(stats?.totalDiscountsGiven)}</span>
            </div>
          </div>

          {/* Discount Details List */}
          {showDiscounts && (
            <div className="mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
              {loadingDiscounts ? (
                <div className="text-center text-xs text-gray-400">در حال دریافت...</div>
              ) : (
                <div className="max-h-60 overflow-y-auto text-xs space-y-2 pr-1">
                  {discountDetails.length === 0 ? (
                    <p className="text-center text-gray-400">موردی یافت نشد</p>
                  ) : (
                    discountDetails.map(order => (
                      <div key={order.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                        <div>
                          <span className="font-bold text-gray-700 block">سفارش #{order.wp_order_id}</span>
                          <span className="text-gray-400 text-[10px]">
                            {new Date(order.completed_at).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        <div className="text-left">
                          {Number(order.affiliate_amount) > 0 && (
                            <div className="text-orange-600">افیلیت: {formatPrice(order.affiliate_amount)}</div>
                          )}
                          {Number(order.coupon_amount) > 0 && (
                            <div className="text-blue-600">کوپن: {formatPrice(order.coupon_amount)} ({order.coupon_code})</div>
                          )}
                          {Number(order.loyalty_amount) > 0 && (
                            <div className="text-purple-600">الماس: {formatPrice(order.loyalty_amount)}</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
          <p>نمودار روند سود (به زودی)</p>
        </div>
      </div>
    </div>
  );
}
