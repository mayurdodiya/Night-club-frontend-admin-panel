import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSubscriptions } from '@/hooks/useSubscriptions'

export default function Subscriptions() {
  const { plans, loading, updatePlan } = useSubscriptions()
  const [editing, setEditing] = useState(null)
  const [amount, setAmount] = useState('')

  function openEdit(plan) {
    setEditing(plan)
    setAmount(String(plan.amount ?? ''))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await updatePlan(editing.id || editing._id, Number(amount))
    setEditing(null)
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Subscriptions</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState message="No subscription plans found." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id || plan._id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{plan.name || 'Plan'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}>
                  <Pencil size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-zinc-100">₹{plan.amount}</span>
                <p className="text-sm text-muted">per {plan.duration || 'period'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plan Price</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="s-amount">Amount (₹)</Label>
              <Input id="s-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
