
import { useState } from "react";
import { AnalysisResult } from "@/utils/analysisEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Award, BarChart3, BookOpen, CheckCircle, Download, XCircle } from "lucide-react";

interface AnalysisProps {
  result: AnalysisResult;
  onRestart: () => void;
}

const Analysis = ({ result, onRestart }: AnalysisProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Satisfactory";
    if (score >= 50) return "Needs Improvement";
    return "Poor";
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-4xl">
        <Card className="glass shadow-glass-strong animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-light tracking-tight mb-2">Interview Analysis</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Your performance evaluation and improvement recommendations
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="scores">Detailed Scores</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6 bg-background/50 rounded-lg border">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full flex items-center justify-center bg-primary/10">
                      <div className="text-4xl font-semibold text-primary">
                        {result.overallScore}
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-card p-1 rounded-full">
                      <Award className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-medium mb-1">Overall Performance</h3>
                  <p className={`text-lg font-medium ${getScoreColor(result.overallScore)}`}>
                    {getScoreLabel(result.overallScore)}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background/50 rounded-lg border space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {result.strengths.map((strength, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <div className="w-1 h-1 rounded-full bg-green-600 mt-1.5 mr-2"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-background/50 rounded-lg border space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <XCircle className="h-5 w-5 text-amber-600 mr-2" />
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {result.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <div className="w-1 h-1 rounded-full bg-amber-600 mt-1.5 mr-2"></div>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => setActiveTab("scores")}
                  >
                    View Detailed Scores
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="scores" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h3 className="font-medium">Confidence</h3>
                          <p className="text-sm text-muted-foreground">How confident you appear during responses</p>
                        </div>
                        <span 
                          className={`text-lg font-semibold ${getScoreColor(result.confidenceScore)}`}
                        >
                          {result.confidenceScore}
                        </span>
                      </div>
                      <Progress value={result.confidenceScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h3 className="font-medium">Clarity</h3>
                          <p className="text-sm text-muted-foreground">How clearly you articulate your thoughts</p>
                        </div>
                        <span 
                          className={`text-lg font-semibold ${getScoreColor(result.clarityScore)}`}
                        >
                          {result.clarityScore}
                        </span>
                      </div>
                      <Progress value={result.clarityScore} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h3 className="font-medium">Relevance</h3>
                          <p className="text-sm text-muted-foreground">How well you address the specific questions</p>
                        </div>
                        <span 
                          className={`text-lg font-semibold ${getScoreColor(result.relevanceScore)}`}
                        >
                          {result.relevanceScore}
                        </span>
                      </div>
                      <Progress value={result.relevanceScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h3 className="font-medium">Detail</h3>
                          <p className="text-sm text-muted-foreground">How detailed and thorough your answers are</p>
                        </div>
                        <span 
                          className={`text-lg font-semibold ${getScoreColor(result.detailScore)}`}
                        >
                          {result.detailScore}
                        </span>
                      </div>
                      <Progress value={result.detailScore} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="p-5 bg-primary/5 rounded-lg border border-primary/10">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 text-primary mr-2" />
                    Performance Insights
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <p>
                      Your strongest area is <span className="font-medium">{
                        Object.entries({
                          Confidence: result.confidenceScore,
                          Clarity: result.clarityScore,
                          Relevance: result.relevanceScore,
                          Detail: result.detailScore
                        }).sort((a, b) => b[1] - a[1])[0][0]
                      }</span>, which shows in your interview responses. 
                    </p>
                    
                    <p>
                      To improve your overall performance, focus on developing your <span className="font-medium">{
                        Object.entries({
                          Confidence: result.confidenceScore,
                          Clarity: result.clarityScore,
                          Relevance: result.relevanceScore,
                          Detail: result.detailScore
                        }).sort((a, b) => a[1] - b[1])[0][0]
                      }</span> skills in future interviews.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => setActiveTab("feedback")}
                  >
                    View Recommendations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="feedback" className="space-y-6">
                <div className="p-6 bg-background/50 rounded-lg border space-y-6">
                  <h3 className="text-xl font-medium flex items-center">
                    <BookOpen className="h-5 w-5 text-primary mr-2" />
                    Recommendations for Improvement
                  </h3>
                  
                  <div className="space-y-4">
                    {result.recommendations.map((recommendation, index) => (
                      <div key={index} className="bg-card rounded-lg p-4 border">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 flex items-center justify-center bg-primary/10 rounded-full w-8 h-8 mr-3 mt-0.5">
                            <span className="text-primary text-sm font-medium">{index + 1}</span>
                          </div>
                          <p>{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-medium mb-4">Next Steps</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Regular practice is key to interview success. We recommend scheduling another practice interview to apply the feedback you've received.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                    <Button onClick={onRestart}>
                      Try Another Interview
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;
