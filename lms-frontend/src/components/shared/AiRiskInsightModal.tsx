import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useAiRiskInsight } from '../../hooks/useAnalytics'
import { useState, useEffect } from 'react'

interface AiRiskInsightModalProps {
  open: boolean
  onClose: () => void
  courseId: string
  studentId: string | null
  studentName: string
}

export function AiRiskInsightModal({ open, onClose, courseId, studentId, studentName }: AiRiskInsightModalProps) {
  const [insight, setInsight] = useState<string | null>(null)
  const getInsight = useAiRiskInsight()

  useEffect(() => {
    if (open && studentId) {
      setInsight(null)
      getInsight.mutate({ courseId, studentId }, {
        onSuccess: (data) => setInsight(data.insight)
      })
    }
  }, [open, studentId, courseId])

  return (
    <Modal open={open} onClose={onClose} title={`AI Risk Insight: ${studentName}`} size="md">
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 min-h-[150px]">
        {getInsight.isPending ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-sm text-gray-500 animate-pulse">Analyzing student trajectory with Claude...</p>
          </div>
        ) : getInsight.isError ? (
          <div className="text-center py-8 text-red-500">
            Failed to generate insight.
          </div>
        ) : (
          <div className="prose prose-sm prose-primary max-w-none whitespace-pre-wrap">
            {insight}
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="secondary">Close</Button>
      </div>
    </Modal>
  )
}
