const colorMap = {
  blue:   'bg-sky-50 text-sky-700',
  green:  'bg-emerald-50 text-emerald-700',
  amber:  'bg-amber-50 text-amber-700',
  purple: 'bg-violet-50 text-violet-700',
};

export default function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  return (
    <div className="rf-card p-5 flex items-center gap-4">
      {Icon && (
        <div className={`flex size-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      )}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  );
}
