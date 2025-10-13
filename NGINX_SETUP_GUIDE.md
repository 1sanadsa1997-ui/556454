# دليل إعداد Nginx لـ PromoHive

## 📋 خطوات التطبيق

### 1. تثبيت Nginx
```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. نسخ ملف الإعدادات
```bash
# النسخة الكاملة (مستحسنة للإنتاج)
sudo cp nginx-promohive.conf /etc/nginx/sites-available/promohive

# أو النسخة المبسطة (للاختبار)
sudo cp nginx-simple.conf /etc/nginx/sites-available/promohive
```

### 3. تفعيل الموقع
```bash
sudo ln -s /etc/nginx/sites-available/promohive /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # إزالة الموقع الافتراضي
```

### 4. اختبار الإعدادات
```bash
sudo nginx -t
```

### 5. إعادة تحميل Nginx
```bash
sudo systemctl reload nginx
```

### 6. إعداد SSL مع Let's Encrypt
```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx -y

# الحصول على شهادة SSL
sudo certbot --nginx -d globalpromonetwork.store -d www.globalpromonetwork.store

# اختبار التجديد التلقائي
sudo certbot renew --dry-run
```

## 🔧 إعدادات إضافية

### إعداد Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### مراقبة Logs
```bash
# مراقبة logs في الوقت الفعلي
sudo tail -f /var/log/nginx/promohive.access.log
sudo tail -f /var/log/nginx/promohive.error.log

# مراقبة حالة Nginx
sudo systemctl status nginx
```

### إعادة تشغيل الخدمات
```bash
# إعادة تشغيل Nginx
sudo systemctl restart nginx

# إعادة تشغيل PromoHive
pm2 restart promohive
```

## 🚨 استكشاف الأخطاء

### مشاكل شائعة:
1. **خطأ 502 Bad Gateway**: تأكد أن التطبيق يعمل على المنفذ 8080
2. **خطأ SSL**: تأكد من صحة مسارات الشهادات
3. **خطأ Permission**: تأكد من صلاحيات الملفات

### أوامر التشخيص:
```bash
# فحص حالة الخدمات
sudo systemctl status nginx
pm2 status

# فحص المنافذ
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
sudo netstat -tlnp | grep :8080

# اختبار الاتصال
curl -I http://localhost:8080
curl -I https://globalpromonetwork.store
```

## 📊 مراقبة الأداء

### إضافة مراقبة الأداء:
```bash
# تثبيت htop للمراقبة
sudo apt install htop -y

# مراقبة استخدام الذاكرة والمعالج
htop

# مراقبة استخدام القرص
df -h
```

### تحسين الأداء:
```bash
# زيادة عدد العمال في Nginx
sudo nano /etc/nginx/nginx.conf
# أضف: worker_processes auto;

# تحسين إعدادات النظام
sudo nano /etc/sysctl.conf
# أضف:
# net.core.somaxconn = 65535
# net.core.netdev_max_backlog = 5000
```

## 🔐 أمان إضافي

### حماية من DDoS:
```bash
# إضافة fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### تحديث النظام:
```bash
# تحديث دوري
sudo apt update && sudo apt upgrade -y
```

## 📝 ملاحظات مهمة

1. **تأكد من تحديث domain name** في ملفات الإعدادات
2. **احتفظ بنسخة احتياطية** من ملفات الإعدادات
3. **راقب logs بانتظام** لاكتشاف المشاكل مبكراً
4. **اختبر الإعدادات** قبل تطبيقها على الإنتاج
5. **استخدم HTTPS دائماً** في الإنتاج

## 🆘 الدعم

في حالة وجود مشاكل:
1. تحقق من logs
2. اختبر الإعدادات بـ `nginx -t`
3. تأكد من حالة الخدمات
4. راجع إعدادات Firewall
