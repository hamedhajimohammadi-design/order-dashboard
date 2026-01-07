"use client";
import { useOrderStore } from "@/store/useOrderStore";
import { useState } from "react";
import { ArrowUpDown } from 'lucide-react';

export default function HistoryTable({ orders, showActions, onSort }) {
  const { releaseOrder } = useOrderStore();
  const [loadingId, setLoadingId] = useState(null);
  const [sortBy, setSortBy] = useState('order_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleReturnToQueue = async (orderId) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این سفارش را به صف انتظار برگردانید؟")) return;
    
    setLoadingId(orderId);
    try {
      const res = await fetch('/api/orders/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (res.ok) {
        alert("سفارش با موفقیت به صف بازگشت.");
        window.location.reload();
      } else {
        alert("خطا در بازگشت سفارش.");
      }
    } catch (error) {
      console.error(error);
      alert("خطای شبکه.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSort = (field) => {
    const newOrder = (sortBy === field && sortOrder === 'desc') ? 'asc' : 'desc';
    setSortBy(field);
    setSortOrder(newOrder);
    
    if (onSort) {
        onSort(field, newOrder);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'wc-wrong-info': 'bg-orange-100 text-orange-700 border-orange-200',
      'wrong-info': 'bg-orange-100 text-orange-700 border-orange-200',
      'wrong_info': 'bg-orange-100 text-orange-700 border-orange-200',
      'wc-awaiting-auth': 'bg-purple-100 text-purple-700 border-purple-200',
      'need-verification': 'bg-purple-100 text-purple-700 border-purple-200',
      'verification': 'bg-purple-100 text-purple-700 border-purple-200',
      'processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'on-hold': 'bg-gray-100 text-gray-700 border-gray-200',
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'failed': 'bg-red-100 text-red-700 border-red-200',
      'cancelled': 'bg-red-50 text-red-500 border-red-100',
      'refund-req': 'bg-red-100 text-red-700 border-red-200',
      'awaiting-refund': 'bg-red-100 text-red-700 border-red-200',
      'refunded': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    
    const labels = {
      'completed': 'تکمیل شده',
      'wc-wrong-info': 'اطلاعات اشتباه',
      'wrong-info': 'اطلاعات اشتباه',
      'wrong_info': 'اطلاعات اشتباه',
      'wc-awaiting-auth': 'نیاز به احراز',
      'need-verification': 'نیاز به احراز',
      'verification': 'نیاز به احراز',
      'processing': 'در حال انجام',
      'on-hold': 'در انتظار پرداخت',
      'pending': 'در انتظار پرداخت',
      'failed': 'ناموفق',
      'cancelled': 'لغو شده',
      'refund-req': 'در انتظار استرداد',
      'awaiting-refund': 'در انتظار استرداد',
      'refunded': 'مسترد شد',
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-bold border ${styles[status] || 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (!orders || orders.length === 0) {
    return <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">هیچ موردی یافت نشد.</div>;
  }

  // Local sorting if onSort is not provided (client-side)
  const sortedOrders = onSort ? orders : [...orders].sort((a, b) => {
    let valA, valB;
    if (sortBy === 'order_id') {
        valA = Number(a.wp_order_id);
        valB = Number(b.wp_order_id);
    } else if (sortBy === 'updated') {
        valA = new Date(a.updated_at).getTime();
        valB = new Date(b.updated_at).getTime();
    } else { // order_date
        valA = new Date(a.order_date).getTime();
        valB = new Date(b.order_date).getTime();
    }

    if (sortOrder === 'asc') {
        return valA - valB;
    } else {
        return valB - valA;
    }
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-500 border-b">
            <tr>
              <th className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('order_id')}>
                <div className="flex items-center gap-1">
                    #
                    {sortBy === 'order_id' && <ArrowUpDown size={14} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                </div>
              </th>
              <th className="p-4 font-bold">محصول</th>
              <th className="p-4 font-bold">مشتری</th>
              <th className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('order_date')}>
                <div className="flex items-center gap-1">
                    تاریخ ثبت
                    {sortBy === 'order_date' && <ArrowUpDown size={14} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                </div>
              </th>
              <th className="p-4 font-bold text-center cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('updated')}>
                <div className="flex items-center justify-center gap-1">
                    آخرین تغییر
                    {sortBy === 'updated' && <ArrowUpDown size={14} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                </div>
              </th>
              <th className="p-4 font-bold text-center">اپراتور</th>
              <th className="p-4 font-bold">وضعیت</th>
              <th className="p-4 font-bold text-left">مبلغ نهایی</th>
              {showActions && <th className="p-4 font-bold text-center">عملیات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition duration-150">
                {/* شماره سفارش */}
                <td className="p-4 font-mono font-bold text-gray-600 bg-gray-50/50 w-24 text-center">
                  #{order.wp_order_id}
                </td>
                
                {/* محصول */}
                <td className="p-4">
                    <div className="font-bold text-gray-800 text-sm leading-6">{order.order_title || '---'}</div>
                    <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">{order.payment_method}</div>
                </td>

                {/* ستون مشتری */}
                <td className="p-4">
                    <div className="flex flex-col">
                        {order.user?.first_name ? (
                            <>
                                <div className="text-sm font-bold text-gray-800">
                                    {order.user.first_name} {order.user.last_name || ''}
                                </div>
                                <div className="text-[11px] text-blue-500 font-mono mt-0.5">
                                    {order.user?.phone_number}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm font-bold text-gray-700 font-mono tracking-wider bg-gray-50 px-2 py-1 rounded-lg w-fit">
                                {order.user?.phone_number || '---'}
                            </div>
                        )}
                    </div>
                </td>

                {/* تاریخ ثبت */}
                <td className="p-4 text-gray-500 text-xs font-mono">
                   {new Date(order.order_date).toLocaleDateString('fa-IR')}
                   <span className="block text-[10px] text-gray-400 mt-1">
                       {new Date(order.order_date).toLocaleTimeString('fa-IR', {hour:'2-digit', minute:'2-digit'})}
                   </span>
                </td>

                {/* زمان آخرین تغییر (تکمیل یا آپدیت) */}
                <td className="p-4 text-center text-xs font-mono">
                   {order.updated_at ? (
                       <div className="flex flex-col items-center">
                           <span className="text-gray-700 font-bold">
                               {new Date(order.updated_at).toLocaleDateString('fa-IR')}
                           </span>
                           <span className="text-[10px] text-gray-400 mt-1">
                               {new Date(order.updated_at).toLocaleTimeString('fa-IR', {hour:'2-digit', minute:'2-digit'})}
                           </span>
                       </div>
                   ) : (
                       <span className="text-gray-300 italic">---</span>
                   )}
                </td>

                {/* اپراتور */}
                <td className="p-4 text-center">
                  {order.operator_name ? (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-100">
                      {order.operator_name}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-[10px]">---</span>
                  )}
                </td>

                <td className="p-4">{getStatusBadge(order.status)}</td>

                {/* مبلغ نهایی */}
                <td className="p-4 font-bold text-emerald-600 text-left">
                  {parseInt(order.final_payable || 0).toLocaleString()} <span className="text-[10px] font-normal text-gray-400">تومان</span>
                </td>
                
                {/* عملیات: فقط برای وضعیت‌های خاص */}
                {showActions && (
                  <td className="p-4 text-center">
                    {(['wc-wrong-info', 'wrong-info', 'wc-awaiting-auth', 'need-verification'].includes(order.status)) ? (
                        <button 
                            onClick={() => handleReturnToQueue(order.id)}
                            disabled={loadingId === order.id}
                            className="bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
                        >
                            {loadingId === order.id ? '...' : '↩ بازگشت به صف'}
                        </button>
                    ) : (
                        <span className="text-gray-300 text-[10px] cursor-not-allowed">
                            غیرقابل بازگشت
                        </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
