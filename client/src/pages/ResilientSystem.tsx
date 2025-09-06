import { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, Download, AlertTriangle, CheckCircle, Clock, FileText, Shield, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ResilientSystemDemo = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps] = useState(5);
  const [mode, setMode] = useState('normal'); // normal, safe
  const [logs, setLogs] = useState<any[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [systemStatus, setSystemStatus] = useState('جاهز');
  const [operationSummary, setOperationSummary] = useState<any>(null);
  
  const logAreaRef = useRef<HTMLDivElement>(null);
  const maxAttempts = 3;
  
  const operations = [
    { name: "تحضير البيانات", duration: 1500, failureRate: 0.3 },
    { name: "معالجة البيانات", duration: 2000, failureRate: 0.4 },
    { name: "حفظ النتائج", duration: 1000, failureRate: 0.2 },
    { name: "إرسال التقرير", duration: 1800, failureRate: 0.3 },
    { name: "تنظيف الملفات المؤقتة", duration: 800, failureRate: 0.1 }
  ];

  // إضافة لوج جديد
  const addLog = (message: string, type = 'info', operation: string | null = null) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    const newLog = {
      id: Date.now() + Math.random(),
      timestamp,
      message,
      type,
      operation,
      attempt: attempts
    };
    setLogs(prev => [...prev, newLog]);
  };

  // تمرير اللوق تلقائياً للأسفل
  useEffect(() => {
    if (logAreaRef.current) {
      logAreaRef.current.scrollTop = logAreaRef.current.scrollHeight;
    }
  }, [logs]);

  // محاكاة عملية مع احتمالية فشل
  const simulateOperation = (operation: any) => {
    return new Promise((resolve, reject) => {
      const failureRate = mode === 'safe' ? operation.failureRate * 0.3 : operation.failureRate;
      
      setTimeout(() => {
        if (Math.random() < failureRate) {
          const errorTypes = [
            'فشل في الاتصال بقاعدة البيانات',
            'انتهت مهلة الاستجابة',
            'خطأ في صلاحيات الوصول',
            'مساحة القرص ممتلئة',
            'خطأ في الشبكة'
          ];
          const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
          reject(new Error(randomError));
        } else {
          resolve(undefined);
        }
      }, operation.duration);
    });
  };

  // تنفيذ عملية مع Auto-Recovery
  const executeOperationWithRecovery = async (operation: any, stepIndex: number) => {
    let currentAttempt = 0;
    
    while (currentAttempt < maxAttempts) {
      try {
        currentAttempt++;
        setAttempts(currentAttempt);
        
        const modeText = mode === 'safe' ? ' (الوضع الآمن)' : '';
        addLog(`⏳ المحاولة ${currentAttempt}: ${operation.name}${modeText}`, 'info', operation.name);
        setSystemStatus(`${operation.name} - المحاولة ${currentAttempt}`);
        
        await simulateOperation(operation);
        
        // نجحت العملية
        addLog(`✅ نجح تنفيذ: ${operation.name}`, 'success', operation.name);
        return true;
        
      } catch (error: any) {
        setErrors(prev => prev + 1);
        addLog(`❌ فشلت المحاولة ${currentAttempt}: ${error.message}`, 'error', operation.name);
        
        if (currentAttempt < maxAttempts) {
          const waitTime = currentAttempt * 1000;
          addLog(`🔄 إعادة المحاولة خلال ${waitTime/1000} ثانية...`, 'warning', operation.name);
          setSystemStatus('جاري الاستشفاء...');
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // فشلت جميع المحاولات
    addLog(`💥 فشل نهائي في: ${operation.name}`, 'error', operation.name);
    
    // الدخول في Safe Mode إذا لم نكن فيه بالفعل
    if (mode === 'normal') {
      addLog('⚠️ تفعيل الوضع الآمن بسبب الفشل المتكرر...', 'warning');
      setMode('safe');
      
      // إعادة المحاولة في Safe Mode
      addLog(`🛡️ إعادة محاولة ${operation.name} في الوضع الآمن...`, 'info', operation.name);
      setSystemStatus(`${operation.name} - الوضع الآمن`);
      
      try {
        await simulateOperation(operation);
        addLog(`✅ نجح في الوضع الآمن: ${operation.name}`, 'success', operation.name);
        return true;
      } catch (error: any) {
        addLog(`❌ فشل حتى في الوضع الآمن: ${operation.name}`, 'error', operation.name);
        return false;
      }
    }
    
    return false;
  };

  // تشغيل النظام الكامل
  const runResilientSystem = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentStep(0);
    setAttempts(0);
    setErrors(0);
    setOperationSummary(null);
    
    const startTime = Date.now();
    addLog('🚀 بدء تشغيل النظام المقاوم للأخطاء', 'info');
    addLog(`📊 إجمالي العمليات: ${operations.length}`, 'info');
    
    let successfulOperations = 0;
    let totalAttempts = 0;
    
    for (let i = 0; i < operations.length; i++) {
      setCurrentStep(i + 1);
      setAttempts(0);
      
      const initialAttempts = attempts;
      const success = await executeOperationWithRecovery(operations[i], i);
      const operationAttempts = attempts - initialAttempts;
      totalAttempts += operationAttempts;
      
      if (success) {
        successfulOperations++;
      }
      
      // توقف قصير بين العمليات
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // تكوين التقرير النهائي
    const summary = {
      totalOperations: operations.length,
      successfulOperations,
      failedOperations: operations.length - successfulOperations,
      totalAttempts,
      totalErrors: errors,
      successRate: (successfulOperations / operations.length * 100).toFixed(1),
      duration: duration.toFixed(1),
      finalMode: mode,
      timestamp: new Date().toLocaleString('ar-SA')
    };
    
    setOperationSummary(summary);
    setSystemStatus(successfulOperations === operations.length ? 'اكتمل بنجاح' : 'اكتمل مع أخطاء');
    
    addLog('📈 تم إنشاء التقرير النهائي', 'info');
    addLog(`✅ العمليات الناجحة: ${successfulOperations}/${operations.length}`, 'success');
    addLog(`⚡ معدل النجاح: ${summary.successRate}%`, 'info');
    addLog(`⏱️ المدة الإجمالية: ${summary.duration} ثانية`, 'info');
    
    setIsRunning(false);
  };

  // إعادة تعيين النظام
  const resetSystem = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setMode('normal');
    setAttempts(0);
    setErrors(0);
    setSystemStatus('جاهز');
    setOperationSummary(null);
    setLogs([]);
    addLog('🔄 تم إعادة تعيين النظام', 'info');
  };

  // حفظ السجلات
  const saveLogs = () => {
    const logContent = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const summary = operationSummary ? 
      `\n\n=== التقرير النهائي ===\n${JSON.stringify(operationSummary, null, 2)}` : '';
    
    const fullContent = logContent + summary;
    
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addLog('💾 تم حفظ السجلات والتقرير', 'success');
  };

  const getProgressPercentage = () => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'safe': return <Shield className="w-5 h-5 text-yellow-600" />;
      default: return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold mb-2">🛡️ نظام مقاوم للأخطاء</CardTitle>
          <p className="text-blue-100">عرض تفاعلي للمفاهيم: Auto-Recovery • Safe Mode • Log Saving • Progress Tracking • Error Handling</p>
        </CardHeader>
      </Card>

      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {getModeIcon()}
              <span className="font-semibold">الوضع الحالي</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {mode === 'safe' ? 'آمن' : 'عادي'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span className="font-semibold">حالة النظام</span>
            </div>
            <div className="text-lg font-bold text-green-600">{systemStatus}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">التقدم</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {currentStep}/{totalSteps} ({getProgressPercentage()}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold">الأخطاء</span>
            </div>
            <div className="text-lg font-bold text-red-600">{errors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <Card>
          <CardContent className="p-6">
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="text-center mt-2 text-sm text-muted-foreground">
              {isRunning ? `جاري التنفيذ... (المحاولة ${attempts})` : 'مكتمل'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Buttons */}
      <div className="flex gap-4 flex-wrap">
        <Button
          onClick={runResilientSystem}
          disabled={isRunning}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
          data-testid="button-run-system"
        >
          {isRunning ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isRunning ? 'جاري التشغيل...' : 'تشغيل النظام'}
        </Button>

        <Button
          onClick={resetSystem}
          disabled={isRunning}
          variant="secondary"
          className="flex items-center gap-2"
          data-testid="button-reset-system"
        >
          <RotateCcw className="w-5 h-5" />
          إعادة تعيين
        </Button>

        <Button
          onClick={saveLogs}
          variant="outline"
          className="flex items-center gap-2"
          data-testid="button-save-logs"
        >
          <Download className="w-5 h-5" />
          حفظ السجلات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              سجل العمليات ({logs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={logAreaRef}
              className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm h-80 overflow-y-auto"
              data-testid="system-logs"
            >
              {logs.map(log => (
                <div key={log.id} className={`mb-1 ${getLogColor(log.type)}`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> 
                  <span className="ml-1">{getLogIcon(log.type)}</span>
                  {log.message}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500 italic">لا توجد سجلات بعد...</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operation Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                العمليات المجدولة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {operations.map((op, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded ${
                  index < currentStep ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  index === currentStep - 1 && isRunning ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <span>{op.name}</span>
                  <span className="text-sm">
                    {index < currentStep ? '✅' : index === currentStep - 1 && isRunning ? '⏳' : '⏸️'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Final Summary */}
          {operationSummary && (
            <Card>
              <CardHeader>
                <CardTitle>📊 التقرير النهائي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>العمليات الناجحة:</span>
                  <span className="font-semibold text-green-600">
                    {operationSummary.successfulOperations}/{operationSummary.totalOperations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>معدل النجاح:</span>
                  <span className="font-semibold">{operationSummary.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي المحاولات:</span>
                  <span className="font-semibold">{operationSummary.totalAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span>المدة الإجمالية:</span>
                  <span className="font-semibold">{operationSummary.duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span>الوضع النهائي:</span>
                  <span className="font-semibold">{operationSummary.finalMode === 'safe' ? 'آمن' : 'عادي'}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Features Description */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-primary mb-4">🎯 المفاهيم المطبقة في هذا العرض:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">🔄 Auto-Recovery:</span>
                <span>إعادة المحاولة التلقائية (حتى 3 مرات) مع زيادة وقت الانتظار</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 font-semibold">🛡️ Safe Mode:</span>
                <span>الدخول في وضع آمن عند الفشل المتكرر لتقليل معدل الأخطاء</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">📊 Progress Tracking:</span>
                <span>متابعة دقيقة لتقدم العمليات والإحصائيات</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-purple-600 font-semibold">💾 Log Saving:</span>
                <span>تسجيل جميع الأحداث وحفظها في ملف قابل للتحميل</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-semibold">⚡ Error Handling:</span>
                <span>معالجة ذكية للأخطاء مع تصنيف وتقارير مفصلة</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResilientSystemDemo;