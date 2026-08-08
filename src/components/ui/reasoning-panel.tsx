import { Brain, FileText, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"

interface ReasoningPanelProps {
  confidenceScore: number
  reasoning: string[]
  policies?: string[]
  executionTime?: string
}

export function ReasoningPanel({ confidenceScore, reasoning, policies, executionTime }: ReasoningPanelProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm text-primary">
            <Brain className="h-4 w-4" />
            AI Reasoning Log
          </CardTitle>
          <div className="flex items-center gap-2">
            {executionTime && <span className="text-xs text-gray-400">{executionTime}</span>}
            <Badge variant={confidenceScore > 80 ? "success" : "pending"}>
              {confidenceScore}% Confidence
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {reasoning.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
        
        {policies && policies.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Retrieved Policies
            </p>
            <div className="flex flex-wrap gap-2">
              {policies.map((p, idx) => (
                <Badge key={idx} variant="outline" className="text-xs text-gray-400">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
