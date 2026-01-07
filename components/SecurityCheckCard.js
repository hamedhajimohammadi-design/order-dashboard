
import { Shield, CreditCard, UserCheck, AlertTriangle, CheckCircle, FileText, ExternalLink, Eye } from 'lucide-react';

export default function SecurityCheckCard({ order }) {
    const user = order.user || {};
    const paymentCard = order.payment_card_number;
    const kycCard = user.card_number;
    
    // Construct URL based on available data
    let verificationImageUrl = null;
    if (user.verification_file) {
        const wcId = user.metadata?.wc_id;
        if (wcId) {
            // New structure: mnsfpt_documents/{wc_id}/{filename}
            verificationImageUrl = `https://pgemshop.com/wp-content/uploads/mnsfpt_documents/${wcId}/${user.verification_file}`;
        } else {
            // Fallback (Legacy): mnsfpt_uploads/{filename}
            verificationImageUrl = `https://pgemshop.com/wp-content/uploads/mnsfpt_uploads/${user.verification_file}`;
        }
    }

    // Helper to open image using the proxy to bypass hotlink protection
    const handleImageClick = (e) => {
        e.preventDefault();
        if (!verificationImageUrl) return;
        
        // Use the proxy route
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(verificationImageUrl)}`;
        window.open(proxyUrl, '_blank');
    };

    // --- Logic: Compare Cards ---
    let cardMatchStatus = 'missing'; // missing, match, mismatch, manual_check
    
    if (paymentCard && kycCard) {
        // Normalize: remove spaces, dashes
        const p = paymentCard.replace(/\D/g, '');
        const k = kycCard.replace(/\D/g, '');
        
        // Compare last 4 digits
        if (p.slice(-4) === k.slice(-4)) {
            cardMatchStatus = 'match';
        } else {
            cardMatchStatus = 'mismatch';
        }
    } else if (user.is_verified && !kycCard) {
        // Verified user (has image) but no card number in text field -> Manual Check
        cardMatchStatus = 'manual_check';
    } else if (!paymentCard && !kycCard) {
        cardMatchStatus = 'missing';
    } else {
        // One is missing (and not the manual check scenario)
        cardMatchStatus = 'incomplete';
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-gray-800">بررسی امنیتی و احراز هویت (KYC)</h3>
                </div>
                
                {/* Status Badge */}
                {user.is_verified ? (
                    <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                        <CheckCircle className="w-3 h-3" />
                        احراز شده
                    </span>
                ) : (
                    <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        تایید نشده
                    </span>
                )}
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-100">
                
                {/* Left Side: Gateway Payment Info */}
                <div className="pb-4 md:pb-0 md:pl-4 space-y-3">
                    <h4 className="text-sm font-bold text-gray-500 flex items-center gap-1 mb-2">
                        <CreditCard className="w-4 h-4" />
                        اطلاعات پرداخت (درگاه)
                    </h4>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-xs text-gray-400 block mb-1">کارت استفاده شده در پرداخت:</span>
                        {paymentCard ? (
                            <div className="font-mono font-bold text-lg text-gray-800 dir-ltr tracking-wider">
                                {paymentCard}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic">
                                کیف پول / بدون کارت
                            </div>
                        )}
                    </div>

                    {/* Match Status Alert */}
                    {cardMatchStatus === 'match' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-xs font-bold">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            تطابق سیستمی تایید شد
                        </div>
                    )}
                    {cardMatchStatus === 'mismatch' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-xs font-bold">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            هشدار: عدم تطابق کارت پرداخت با کارت احراز شده
                        </div>
                    )}
                    {cardMatchStatus === 'manual_check' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 text-blue-700 text-xs font-bold">
                            <Eye className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                بررسی چشمی تصویر الزامیست
                                <p className="font-normal opacity-80 mt-1">شماره کارت ثبت نشده. لطفا تصویر مدرک را با شماره کارت پرداخت مقایسه کنید.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: KYC Evidence */}
                <div className="pt-4 md:pt-0 md:pr-4 space-y-3">
                    <h4 className="text-sm font-bold text-gray-500 flex items-center gap-1 mb-2">
                        <UserCheck className="w-4 h-4" />
                        مدارک احراز هویت
                    </h4>

                    {/* Hero Image Button */}
                    {verificationImageUrl ? (
                        <div 
                            onClick={handleImageClick}
                            className="group relative block w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-300 transition-all cursor-pointer"
                            title="برای مشاهده تصویر کامل کلیک کنید"
                        >
                            {/* Placeholder / Thumbnail Effect */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-indigo-600 transition">
                                <FileText className="w-8 h-8 mb-2" />
                                <span className="text-xs font-bold">مشاهده تصویر مدرک</span>
                            </div>
                            {/* If we could load the image as bg, we would. For now, just a nice button area. */}
                            <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors"></div>
                            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-600 shadow-sm flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                باز کردن
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-32 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                            <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs">تصویر مدرک یافت نشد</span>
                        </div>
                    )}

                    {/* Text Details */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
                            <span className="text-gray-500">نام حقیقی:</span>
                            <span className="font-bold text-gray-800">{user.real_name || '---'}</span>
                        </div>
                        <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
                            <span className="text-gray-500">کد ملی:</span>
                            <span className="font-mono text-gray-800">{user.national_code || '---'}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1">
                            <span className="text-gray-500">شماره کارت (متنی):</span>
                            <span className="font-mono text-gray-800 dir-ltr">
                                {user.card_number ? `...${user.card_number.slice(-4)}` : '---'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}