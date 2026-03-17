
"use client";

import { useClinic } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  FileText,
  Activity,
  Loader2,
  Plus,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useMemoFirebase, useCollection } from '@/firebase';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientRecord, RecordType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function PatientDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { patients, appointments, t, isLoaded, profile, addPatientRecord, getPatientRecordsQuery } = useClinic();
  const { toast } = useToast();

  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({ title: '', type: 'x-ray' as RecordType, fileData: '' });
  const [isUploading, setIsUploading] = useState(false);

  const recordsQuery = useMemoFirebase(() => getPatientRecordsQuery(id), [id, isLoaded]);
  const { data: recordsData, isLoading: isRecordsLoading } = useCollection<PatientRecord>(recordsQuery);
  const records = recordsData || [];

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const patient = patients.find(p => p.id === id);
  const patientAppointments = appointments.filter(a => a.patientId === id);
  const locale = profile.language === 'ar' ? ar : enUS;

  if (!patient) {
    return (
      <div className="p-6 text-center space-y-4 flex flex-col items-center justify-center h-screen bg-background" dir={profile.language === 'ar' ? 'rtl' : 'ltr'}>
        <h2 className="text-xl font-bold">{t('patientNotFound')}</h2>
        <Button onClick={() => router.push('/clients')}>{t('backToList')}</Button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setRecordForm({ ...recordForm, fileData: reader.result as string });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.title || !recordForm.fileData) {
      toast({ variant: 'destructive', title: t('authError'), description: t('recordTitle') });
      return;
    }

    addPatientRecord(id, {
      title: recordForm.title,
      type: recordForm.type,
      fileData: recordForm.fileData
    });

    toast({ title: t('uploadSuccess') });
    setIsAddRecordOpen(false);
    setRecordForm({ title: '', type: 'x-ray', fileData: '' });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background" dir={profile.language === 'ar' ? 'rtl' : 'ltr'}>
      <header className="p-6 bg-card border-b flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className={`h-6 w-6 ${profile.language === 'ar' ? 'rotate-180' : ''}`} />
        </Button>
        <h1 className="text-xl font-bold">{patient.name}</h1>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 pb-20">
          <Card className="border-none shadow-sm bg-primary/5 rounded-3xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-card rounded-2xl shadow-sm">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="text-start">
                  <h2 className="text-lg font-bold">{patient.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {patient.phone}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-primary/10 text-start">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> {t('notes')}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {patient.notes || t('noNotes')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Medical Records Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-start">
                <Paperclip className="h-4 w-4 text-primary" />
                {t('medicalRecords')}
              </h3>
              <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl gap-2 font-bold text-xs">
                    <Plus className="h-3 w-3" /> {t('add')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xs rounded-[2rem] bg-card" dir={profile.language === 'ar' ? 'rtl' : 'ltr'}>
                  <DialogHeader>
                    <DialogTitle className="text-start">{t('addRecord')}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddRecord} className="space-y-4 pt-4 text-start">
                    <div className="space-y-2">
                      <Label>{t('recordTitle')}</Label>
                      <Input 
                        required 
                        value={recordForm.title} 
                        onChange={e => setRecordForm({...recordForm, title: e.target.value})} 
                        className="rounded-xl h-11"
                        placeholder={t('recordTitle')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('recordType')}</Label>
                      <Select value={recordForm.type} onValueChange={(v: RecordType) => setRecordForm({...recordForm, type: v})}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="x-ray">{t('xRay')}</SelectItem>
                          <SelectItem value="prescription">{t('prescription')}</SelectItem>
                          <SelectItem value="report">{t('report')}</SelectItem>
                          <SelectItem value="other">{t('other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('fileSelect')}</Label>
                      <div className="relative">
                        <Input 
                          type="file" 
                          accept="image/*,.pdf" 
                          onChange={handleFileChange} 
                          className="opacity-0 absolute inset-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-muted rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/10 transition-colors">
                          <ImageIcon className="h-6 w-6" />
                          <span className="text-[10px] font-bold text-center">
                            {recordForm.fileData ? t('uploadSuccess') : t('fileSelect')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button type="submit" disabled={isUploading} className="w-full h-12 rounded-xl mt-4">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('save')}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {records.length > 0 ? (
                records.map(record => (
                  <Card key={record.id} className="border-none shadow-sm bg-card rounded-2xl overflow-hidden active:scale-95 transition-transform">
                    <div className="aspect-square bg-muted relative group">
                      {record.fileData.startsWith('data:image') ? (
                        <img 
                          src={record.fileData} 
                          alt={record.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-full">
                        <p className="text-[8px] text-white font-bold uppercase">{t(record.type as any)}</p>
                      </div>
                    </div>
                    <CardContent className="p-3 text-start">
                      <p className="text-xs font-bold truncate">{record.title}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {format(new Date(record.createdAt), 'd MMM yyyy', { locale })}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 py-10 text-center bg-muted/10 rounded-3xl border-2 border-dashed border-muted/30">
                  <ImageIcon className="h-8 w-8 text-muted/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{t('noRecords')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2 px-1 text-start">
              <Calendar className="h-4 w-4 text-primary" />
              {t('appointmentHistory')}
            </h3>
            
            <div className="space-y-3">
              {patientAppointments.length > 0 ? (
                patientAppointments.map(app => (
                  <Card key={app.id} className="border shadow-sm bg-card rounded-2xl overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1 text-start">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm font-bold">
                            {format(new Date(app.dateTime), 'EEEE d MMMM, hh:mm a', { locale })}
                          </p>
                        </div>
                        {app.treatment && (
                          <p className="text-xs text-muted-foreground">{app.treatment}</p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        app.status === 'attended' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        app.status === 'no-show' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        app.status === 'cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {t(app.status as any)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 bg-muted/20 rounded-3xl border-2 border-dashed border-muted/50">
                  <p className="text-sm text-muted-foreground">{t('noPastAppointments')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {patientAppointments.filter(a => a.status === 'attended').length}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('attended')}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-rose-50 dark:bg-rose-900/10 rounded-3xl">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Calendar className="h-6 w-6 text-rose-600 dark:text-rose-400 mb-2" />
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {patientAppointments.filter(a => a.status === 'cancelled').length}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('cancelled')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
