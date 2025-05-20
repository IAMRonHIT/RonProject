"use client"

import React, { useEffect, useState, Suspense } from "react" // Added Suspense
import { useRouter, useSearchParams } from 'next/navigation' // Added useSearchParams

// Ron AI Relevant Icons
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  BrainCircuit,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  CircleOff,
  DatabaseZap,
  Download,
  Filter,
  ListChecks,
  MessageSquare,
  Mic,
  Moon,
  Network,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  Home,
  UserCog,
  Building2,
  BarChart3,
  Headphones,
  GraduationCap,
  type LucideIcon,
  X // Added X for close button
} from "lucide-react"

// UI component imports
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  InfoIcon,
  CheckCircleIcon,
  ArrowUp,
  ArrowDown,
  Minus,
  FileWarning,
  FolderSyncIcon as UserSync,
} from "lucide-react"

// Define a type for our specific notification
interface SimulationNotification {
  title: string;
  message: string;
  detail1: string;
  detail2: string;
  patientName: string;
  mrn: string;
}

// Notification Component (can be moved to its own file if preferred)
const SimulationNotificationPopup = ({ notification, onClose, onViewCarePlan }: { notification: SimulationNotification; onClose: () => void; onViewCarePlan: () => void; }) => {
  if (!notification) return null;

  return (
    <div className="fixed top-24 right-5 bg-slate-900/80 backdrop-blur-lg rounded-xl shadow-2xl border border-sky-500 p-5 w-96 z-[200] animate-fade-in-down transition-all duration-300 glow-sky-500">
      <div className="flex items-start">
        <div className="bg-sky-600 rounded-full p-2 mr-3.5 flex-shrink-0 border border-sky-400 shadow-lg glow-sky-500">
          <AlertTriangle size={22} className="text-white" />
        </div>
        <div className="flex-grow">
          <h4 className="font-bold text-lg text-slate-100">{notification.title}</h4>
          <p className="text-sm text-slate-300 my-1.5 leading-relaxed">{notification.message}</p>
          {notification.detail1 && <p className="text-xs text-slate-400 mt-1">{notification.detail1}</p>}
          {notification.detail2 && <p className="text-xs text-slate-400 mt-1">{notification.detail2}</p>}
          <div className="mt-4">
            <Button 
              onClick={onViewCarePlan}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold"
            >
              View Care Plan for {notification.patientName}
            </Button>
          </div>
        </div>
        <button onClick={onClose} className="ml-2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-700" title="Close">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

// Wrapper component to use useSearchParams
const DashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [agentPerformance, setAgentPerformance] = useState(92)
  const [complianceScore, setComplianceScore] = useState(98)
  const [dataThroughput, setDataThroughput] = useState(75)
  const [tasksProcessedToday, setTasksProcessedToday] = useState(1450)
  const [avgProcessingTime, setAvgProcessingTime] = useState(2.5)
  const [criticalAlerts, setCriticalAlerts] = useState(3)
  const [currentAutomationLevel, setCurrentAutomationLevel] = useState(80)
  const [activePatientLoad, setActivePatientLoad] = useState(2345)
  const [priorAuthQueue, setPriorAuthQueue] = useState(45)
  const [agentConcurrency, setAgentConcurrency] = useState(65)
  const [fhirConversionRate, setFhirConversionRate] = useState(99.8)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  const [simulationNotification, setSimulationNotification] = useState<SimulationNotification | null>(null);

  useEffect(() => {
    if (searchParams) { // Check if searchParams is not null
      const event = searchParams.get('event');
      if (event === 'new_stroke_plan_simulation') {
        const patientName = searchParams.get('patientName');
      const mrn = searchParams.get('mrn');
      const title = searchParams.get('title');
      const message = searchParams.get('message');
      const detail1 = searchParams.get('detail1');
      const detail2 = searchParams.get('detail2');

      if (patientName && mrn && title && message && detail1 && detail2) {
        setSimulationNotification({ patientName, mrn, title, message, detail1, detail2 });
        // Clean the URL (optional, to prevent re-triggering on refresh)
        // router.replace('/dashboard', undefined); // next/navigation way
      }
    } // This closes if (event === 'new_stroke_plan_simulation')
    } // Add missing closing brace for if (searchParams)
  }, [searchParams, router]);

  const handleCloseSimulationNotification = () => {
    setSimulationNotification(null);
    // Clean the URL to prevent re-triggering on refresh or back navigation
    router.replace('/dashboard', { scroll: false });
  };

  const handleViewCarePlan = () => {
    setSimulationNotification(null); // Close notification
    router.push('/care-plan-generator'); // Navigate to care plan page
  };

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Simulate changing Ron AI data
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentPerformance(Math.floor(Math.random() * 10) + 90)
      setComplianceScore(Math.floor(Math.random() * 5) + 95)
      setDataThroughput(Math.floor(Math.random() * 30) + 60)
      setTasksProcessedToday((prev) => prev + Math.floor(Math.random() * 10))
      setAvgProcessingTime(Number((Math.random() * 1 + 2).toFixed(1)))
      setCriticalAlerts(Math.floor(Math.random() * 5))
      setPriorAuthQueue(Math.floor(Math.random() * 30) + 20)
      setAgentConcurrency(Math.floor(Math.random() * 20) + 55)
      setFhirConversionRate(Number((Math.random() * 0.5 + 99.5).toFixed(1)))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div
      className={`${theme} min-h-screen relative overflow-hidden text-slate-100
      bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] 
      from-[#000000] via-[#0D0D0D] to-[#020202]`}
    >
      {simulationNotification && (
        <SimulationNotificationPopup 
          notification={simulationNotification}
          onClose={handleCloseSimulationNotification}
          onViewCarePlan={handleViewCarePlan}
        />
      )}

      {/* Subtle moving background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-64 -left-64 h-96 w-96 rounded-full bg-cyan-500 opacity-20 mix-blend-soft-light blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-purple-600 opacity-20 mix-blend-soft-light blur-3xl animate-pulse" />
        <div className="absolute top-1/4 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 opacity-10 mix-blend-soft-light blur-3xl animate-pulse-slower" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
              <div className="absolute inset-8 border-4 border-l-green-500 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">RON AI INITIALIZING</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10">
        {/* Header */}
        <header
          className="flex items-center justify-between py-4 mb-6 
            rounded-xl bg-white/5 backdrop-blur-md shadow-[0_0_40px_rgba(0,255,255,0.05)] 
            border border-white/10 transition-colors duration-300"
        >
          <div className="flex items-center space-x-2 ml-4">
            <BrainCircuit className="h-8 w-8 text-cyan-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_2px_rgba(0,255,255,0.8)]">
              Ron AI Platform
            </span>
          </div>

          <div className="flex items-center space-x-6 mr-4">
            <div
              className="hidden md:flex items-center space-x-1 bg-white/5 rounded-full px-3 py-1.5 
              border border-white/10 hover:border-white/20 backdrop-blur-md"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Patients, Tasks..."
                className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-slate-400 hover:text-cyan-400 hover:shadow-cyan-400/20"
                    >
                      <Bell className="h-5 w-5" />
                      {criticalAlerts > 0 && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications ({criticalAlerts} critical)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="text-slate-400 hover:text-cyan-400 hover:shadow-cyan-400/20"
                    >
                      {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle theme</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Avatar>
                <AvatarImage src="https://avatar.vercel.sh/TH?size=40" alt="User" />
                <AvatarFallback className="bg-slate-700 text-cyan-500">TH</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main content grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <Card className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 h-full shadow-lg shadow-cyan-500/5">
              <CardContent className="p-4">
                {/* Main Menu Section */}
                <div className="mb-6">
                  <div className="text-xs text-slate-400 mb-2 font-mono tracking-wider pl-1">MAIN MENU</div>
                  <nav className="space-y-1">
                    <NavItem icon={Home} label="Dashboard" active />
                    <NavItem icon={Users} label="Patients" />
                    <NavItem icon={UserCog} label="Providers" />
                    <NavItem icon={Building2} label="Health Plans" />
                    <NavItem icon={BarChart3} label="Population Health" />
                    <NavItem icon={BrainCircuit} label="Ron AI" />
                    <NavItem icon={ClipboardList} label="Tasks" />
                    <NavItem icon={ListChecks} label="Reports" />
                    <NavItem icon={MessageSquare} label="Communication Hub" />
                  </nav>
                </div>

                {/* System Section */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-slate-400 mb-2 font-mono tracking-wider pl-1">SYSTEM</div>
                  <nav className="space-y-1">
                    <NavItem icon={ShieldCheck} label="Admin" />
                    <NavItem icon={Settings} label="Settings" />
                    <NavItem icon={GraduationCap} label="Ron University" />
                    <NavItem icon={Headphones} label="Support" />
                  </nav>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="text-xs text-slate-400 mb-2 font-mono tracking-wider pl-1">PLATFORM HEALTH</div>
                  <div className="space-y-3">
                    <StatusItem
                      label="Agent Performance"
                      value={agentPerformance}
                      color="cyan"
                      tooltip={`Success Rate: ${agentPerformance}%`}
                    />
                    <StatusItem
                      label="Compliance Score"
                      value={complianceScore}
                      color="green"
                      tooltip={`${complianceScore}% Checks Passed`}
                    />
                    <StatusItem
                      label="Data Throughput"
                      value={dataThroughput}
                      color="blue"
                      tooltip={`Processing ${dataThroughput}% Capacity`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main dashboard area */}
          <div className="col-span-12 md:col-span-9 lg:col-span-7">
            <div className="grid gap-6">
              {/* Overview Card */}
              <Card className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden shadow-lg shadow-cyan-500/5">
                <CardHeader className="border-b border-white/10 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                      Ron AI Overview
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <CyberBadge variant="live">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mr-1 animate-pulse"></div>
                        LIVE
                      </CyberBadge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-cyan-400">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                      title="Tasks Processed"
                      value={tasksProcessedToday}
                      valueSuffix=""
                      icon={ClipboardList}
                      trend={tasksProcessedToday > 1400 ? "up" : "stable"}
                      color="cyan"
                      detail={`Success: ${agentPerformance}%`}
                    />
                    <MetricCard
                      title="Data Points Handled"
                      value={activePatientLoad}
                      valueSuffix=""
                      icon={DatabaseZap}
                      trend="stable"
                      color="purple"
                      detail={`Avg Proc: ${avgProcessingTime}s`}
                    />
                    <MetricCard
                      title="Critical Alerts"
                      value={criticalAlerts}
                      valueSuffix=""
                      icon={Bell}
                      trend={criticalAlerts > 5 ? "up" : "down"}
                      color="blue"
                      detail={`Queue: ${priorAuthQueue} PA`}
                    />
                  </div>

                  {/* Tabs */}
                  <div className="mt-8">
                    <Tabs defaultValue="throughput" className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <TabsList className="bg-white/5 border border-white/10 backdrop-blur-md p-1">
                          <TabsTrigger
                            value="throughput"
                            className="data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400"
                          >
                            Task Throughput
                          </TabsTrigger>
                          <TabsTrigger
                            value="agents"
                            className="data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400"
                          >
                            Agent Activity
                          </TabsTrigger>
                          <TabsTrigger
                            value="data"
                            className="data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400"
                          >
                            Data Metrics
                          </TabsTrigger>
                        </TabsList>
                        {/* Legend */}
                        <div className="flex items-center space-x-3 text-xs text-slate-400">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-cyan-500 mr-1.5"></div>
                            Prior Auth
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-purple-500 mr-1.5"></div>
                            Care Plan
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></div>
                            SDOH Assess.
                          </div>
                        </div>
                      </div>

                      <TabsContent value="throughput" className="mt-0">
                        <div className="h-64 w-full relative bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
                          <RonAIPerformanceChart />
                          <div
                            className="absolute bottom-4 right-4 px-3 py-2 
                              bg-slate-900/70 backdrop-blur-md rounded-md border border-white/10"
                          >
                            <div className="text-xs text-slate-400">Current Task Rate</div>
                            <div className="text-lg font-mono text-cyan-400">{dataThroughput} TPH</div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="agents" className="mt-0">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
                          {/* Header Row */}
                          <div className="grid grid-cols-12 text-xs font-medium text-slate-400 p-3 border-b border-white/10 bg-white/10">
                            <div className="col-span-1">Agent ID</div>
                            <div className="col-span-4">Agent/Task Type</div>
                            <div className="col-span-2">Target/Patient</div>
                            <div className="col-span-2">Success %</div>
                            <div className="col-span-2">Avg Time (s)</div>
                            <div className="col-span-1">Status</div>
                          </div>
                          {/* Agent Rows */}
                          <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
                            <AgentActivityRow
                              id="PA-001"
                              name="Prior Auth Bot"
                              target="Patient #12345"
                              metric1={98.5}
                              metric2={12.3}
                              status="Running"
                            />
                            <AgentActivityRow
                              id="CP-003"
                              name="Care Plan Updater"
                              target="Patient #67890"
                              metric1={99.1}
                              metric2={8.5}
                              status="Running"
                            />
                            <AgentActivityRow
                              id="SDOH-007"
                              name="SDOH Assessor"
                              target="Patient #11223"
                              metric1={100}
                              metric2={5.1}
                              status="Idle"
                            />
                            <AgentActivityRow
                              id="COM-002"
                              name="Communication Agent"
                              target="Provider Group A"
                              metric1={97.2}
                              metric2={1.8}
                              status="Running"
                            />
                            <AgentActivityRow
                              id="FHIR-001"
                              name="FHIR Converter"
                              target="Batch #B78"
                              metric1={fhirConversionRate}
                              metric2={0.9}
                              status="Running"
                            />
                            <AgentActivityRow
                              id="PA-002"
                              name="Prior Auth Bot"
                              target="Patient #99887"
                              metric1={95.0}
                              metric2={15.0}
                              status="Queued"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="data" className="mt-0">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataMetricItem
                              name="Patient Records DB"
                              total={50000}
                              used={activePatientLoad}
                              unit="Records"
                              usageLabel="Active Load"
                              type="Primary DB"
                            />
                            <DataMetricItem
                              name="FHIR Conversion Queue"
                              total={1000}
                              used={priorAuthQueue * 2}
                              unit="Tasks"
                              usageLabel="Current Queue"
                              type="Processing"
                            />
                            <DataMetricItem
                              name="Audit Logs (90 days)"
                              total={50}
                              used={35.2}
                              unit="GB"
                              usageLabel="Storage Used"
                              type="Logs"
                            />
                            <DataMetricItem
                              name="Integration Payloads"
                              total={10000}
                              used={7800}
                              unit="Msgs/day"
                              usageLabel="Daily Volume"
                              type="API Cache"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              {/* Security & Alerts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Security Card */}
                <Card className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                  <CardHeader className="pb-2 border-b border-white/10">
                    <CardTitle className="text-slate-100 flex items-center text-base">
                      <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />
                      Compliance & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">HIPAA Checks</div>
                        <CyberBadge variant="success">Active</CyberBadge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">CMS Rule Adherence</div>
                        <CyberBadge variant="success">Active</CyberBadge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">Data Encryption (FHIR)</div>
                        <CyberBadge variant="success">Active</CyberBadge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">Audit Log Integrity</div>
                        <div className="text-sm text-cyan-400">
                          Checked <span className="text-slate-500">2 min ago</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="pt-2 mt-2 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-white">Overall Compliance</div>
                          <div className="text-sm text-cyan-400">{complianceScore}%</div>
                        </div>
                        <Progress value={complianceScore} className="h-2 bg-slate-700">
                          <div
                            className={`h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full w-[${complianceScore}%]`}
                          />
                        </Progress>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Alerts Card */}
                <Card className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                  <CardHeader className="pb-2 border-b border-white/10">
                    <CardTitle className="text-slate-100 flex items-center text-base">
                      <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                      Operational Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Check the structure and props passed to AlertItem */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      <AlertItem
                        title="Prior Auth Denied (Action Req.)"
                        time="14:32:12"
                        description="Patient #67890 - Plan XYZ requires addtl. docs"
                        type="error"
                        iconOverride={FileWarning} // Ensure FileWarning is imported correctly
                      />
                      <AlertItem
                        title="High Patient Queue"
                        time="13:45:06"
                        description="Plan ABC Prior Auth queue > 50"
                        type="warning"
                        iconOverride={Users} // Ensure Users is imported correctly
                      />
                      <AlertItem
                        title="QHIN Connection Timeout"
                        time="11:22:51"
                        description="CommonWell Health Alliance endpoint unresponsive"
                        type="warning"
                        iconOverride={Network} // Ensure Network is imported correctly
                      />
                      <AlertItem
                        title="Compliance Check Passed"
                        time="09:12:45"
                        description="Quarterly HIPAA Audit successful"
                        type="success"
                        iconOverride={ShieldCheck} // Ensure ShieldCheck is imported correctly
                      />
                      <AlertItem
                        title="Agent PA-001 Resource Limit"
                        time="08:30:00"
                        description="Agent nearing concurrency limit, scaling up."
                        type="info"
                        iconOverride={Bot} // Ensure Bot is imported correctly
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Communications Card */}
              <Card className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-white/10">
                  <CardTitle className="text-slate-100 flex items-center text-base">
                    <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
                    Platform Communications
                  </CardTitle>
                  <CyberBadge variant="info">{criticalAlerts + 2} Pending Actions</CyberBadge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    <CommunicationItem
                      sender="Care Manager Bot"
                      time="15:42:12"
                      message="Patient #11223 flagged for SDOH follow-up based on assessment."
                      avatar="https://avatar.vercel.sh/CMB?size=32"
                      unread
                    />
                    <CommunicationItem
                      sender="Prior Auth Agent"
                      time="14:30:45"
                      message="PA approved for Patient #99887 - Authorization #ABC123XYZ."
                      avatar="https://avatar.vercel.sh/PAA?size=32"
                    />
                    <CommunicationItem
                      sender="Compliance Monitor"
                      time="12:15:33"
                      message="Audit Log successfully archived for previous month."
                      avatar="https://avatar.vercel.sh/CM?size=32"
                    />
                    <CommunicationItem
                      sender="System Admin"
                      time="09:05:18"
                      message="Platform update scheduled for Sunday 02:00 AM MST."
                      avatar="https://avatar.vercel.sh/SA?size=32"
                      unread
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/10 pt-4">
                  <div className="flex items-center w-full space-x-2">
                    <input
                      type="text"
                      placeholder="Type a message or command..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none 
                      focus:ring-1 focus:ring-cyan-500 backdrop-blur-md"
                    />
                    <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="bg-cyan-600 hover:bg-cyan-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="grid gap-6">
              {/* System Time Card */}
              <Card className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden shadow-lg shadow-cyan-500/5">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 border-b border-white/10">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1 font-mono tracking-wider">PLATFORM TIME</div>
                      <div className="text-3xl font-mono text-cyan-400 drop-shadow-sm">{formatTime(currentTime)}</div>
                      <div className="text-sm text-slate-400">{formatDate(currentTime)}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-md p-3 border border-white/10 backdrop-blur-md">
                        <div className="text-xs text-slate-400 mb-1">Platform Uptime</div>
                        <div className="text-sm font-mono text-slate-200">98d 11:24:52</div>
                      </div>
                      <div className="bg-white/10 rounded-md p-3 border border-white/10 backdrop-blur-md">
                        <div className="text-xs text-slate-400 mb-1">Time Zone</div>
                        <div className="text-sm font-mono text-slate-200">America/Denver</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                <CardHeader className="pb-2 border-b border-white/10">
                  <CardTitle className="text-slate-100 text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton icon={ShieldCheck} label="Run Audit" />
                    <ActionButton icon={Filter} label="Review Queue" />
                    <ActionButton icon={UserSync} label="Sync Roster" />
                    <ActionButton icon={Bot} label="Manage Agents" />
                  </div>
                </CardContent>
              </Card>

              {/* Resource Allocation */}
              <Card className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                <CardHeader className="pb-2 border-b border-white/10">
                  <CardTitle className="text-slate-100 text-base">AI Resource Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-slate-400">Task Processing</div>
                        <div className="text-xs text-cyan-400">{dataThroughput}% capacity</div>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-[${dataThroughput}%]`}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-slate-400">Agent Concurrency</div>
                        <div className="text-xs text-purple-400">{agentConcurrency}% used</div>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[${agentConcurrency}%]`}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-slate-400">FHIR Queue</div>
                        <div className="text-xs text-blue-400">{priorAuthQueue * 2} tasks</div>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-[${(priorAuthQueue * 2) / 10}%]`}
                        ></div>
                      </div>
                    </div>
                    {/* Slider */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-400">Automation Level</div>
                        <div className="flex items-center">
                          <Slider
                            defaultValue={[currentAutomationLevel]}
                            max={100}
                            step={5}
                            className="w-24 mr-2"
                            onValueChange={(value) => setCurrentAutomationLevel(value[0])}
                          />
                          <span className="text-cyan-400">{currentAutomationLevel}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Controls */}
              <Card className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                <CardHeader className="pb-2 border-b border-white/10">
                  <CardTitle className="text-slate-100 text-base">Platform Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckSquare className="text-cyan-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-slate-400">Auto-Approve Low-Risk</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Send className="text-cyan-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-slate-400">Proactive Outreach</Label>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ClipboardCheck className="text-cyan-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-slate-400">SDOH Screening</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CircleOff className="text-cyan-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-slate-400">Maintenance Mode</Label>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        {/* End main grid */}
      </div>
      {/* End container */}
    </div> // End theme wrapper
  )
}

// --- Helper Components ---
// NavItem, StatusItem, MetricCard, RonAIPerformanceChart, AgentActivityRow, DataMetricItem, AlertItem, CommunicationItem, ActionButton, CyberBadge
// These helper components remain unchanged from the original file.
// For brevity, their code is not repeated here but should be included in the final file.

// NavItem
function NavItem({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <Button
      variant="ghost"
      className={`
        w-full justify-start pl-1 transition-colors duration-200 
        hover:text-cyan-400 hover:bg-white/10 hover:shadow-inner
        ${
          active
            ? "bg-white/10 text-cyan-400 shadow-md"
            : "text-slate-400"
        }`}
    >
      <Icon className="mr-2 h-4 w-4" /> {label}
    </Button>
  )
}

// StatusItem with Tooltip
function StatusItem({
  label,
  value,
  color,
  tooltip,
}: { label: string; value: number; color: string; tooltip?: string }) {
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500"
      case "green":
        return "from-green-500 to-emerald-500"
      case "blue":
        return "from-blue-500 to-indigo-500"
      default:
        return "from-cyan-500 to-blue-500"
    }
  }

  const itemContent = (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-xs text-slate-400">{value}%</div>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${getColor()} rounded-full w-[${value}%]`}></div>
      </div>
    </div>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="w-full text-left">{itemContent}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return itemContent
}

// MetricCard
function MetricCard({
  title,
  value,
  valueSuffix = "%",
  icon: Icon,
  trend,
  color,
  detail,
}: {
  title: string
  value: number
  valueSuffix?: string
  icon: LucideIcon
  trend: "up" | "down" | "stable"
  color: string
  detail: string
}) {
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30"
      case "blue":
        return "from-red-500 to-orange-500 border-red-500/30" // This was blue, changed to red/orange for variety
      default:
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-red-500" /> // Trend up is often red if it's bad (e.g. alerts)
      case "down":
        return <ArrowDown className="h-4 w-4 text-green-500" />
      case "stable":
        return <Minus className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className={`relative overflow-hidden p-4 rounded-lg bg-white/5 backdrop-blur-sm border ${getColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{title}</div>
        <Icon className="h-5 w-5 text-slate-100 opacity-60" />
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300 drop-shadow-sm">
        {value.toLocaleString()}
        {valueSuffix}
      </div>
      <div className="text-xs text-slate-500">{detail}</div>
      <div className="absolute bottom-2 right-2 flex items-center">{getTrendIcon()}</div>
      <div
        className={`absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r 
          opacity-20 blur-xl ${getColor().split(" ")[0]}`}
      ></div>
    </div>
  )
}

// Performance Chart
function RonAIPerformanceChart() {
  const [chartData, setChartData] = useState<{ priorAuthHeight: number; carePlanHeight: number; sdohHeight: number }[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const data = Array.from({ length: 24 }).map(() => ({
      priorAuthHeight: Math.floor(Math.random() * 60) + 20,
      carePlanHeight: Math.floor(Math.random() * 40) + 30,
      sdohHeight: Math.floor(Math.random() * 30) + 10,
    }));
    setChartData(data);
    setIsClient(true); 
  }, []); 

  if (!isClient) {
    return <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">Loading chart...</div>;
  };

  return (
    <div className="h-full w-full flex items-end justify-between px-4 pt-4 pb-8 relative">
      <div className="absolute left-2 top-0 h-full flex flex-col justify-between py-4">
        <div className="text-xs text-slate-500">High</div>
        <div className="text-xs text-slate-500">Med</div>
        <div className="text-xs text-slate-500">Low</div>
        <div className="text-xs text-slate-500">Idle</div>
      </div>
      <div className="absolute left-0 right-0 top-0 h-full flex flex-col justify-between py-4 px-10 pointer-events-none">
        <div className="border-b border-white/10 w-full h-1/4"></div>
        <div className="border-b border-white/10 w-full h-1/4"></div>
        <div className="border-b border-white/10 w-full h-1/4"></div>
        <div className="border-b border-white/10 w-full h-1/4"></div>
        <div className="h-0"></div>
      </div>
      <div className="flex-1 h-full flex items-end justify-between px-2 z-10 ml-4">
        {chartData.map((data, i) => (
          <div key={i} className="flex space-x-0.5 h-full items-end">
            <div
              className={`w-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm transition-height duration-300 ease-out h-[${data.priorAuthHeight}%]`}
            ></div>
            <div
              className={`w-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm transition-height duration-300 ease-out h-[${data.carePlanHeight}%]`}
            ></div>
            <div
              className={`w-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-height duration-300 ease-out h-[${data.sdohHeight}%]`}
            ></div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10 ml-4">
        <div className="text-xs text-slate-500">-24h</div>
        <div className="text-xs text-slate-500">-18h</div>
        <div className="text-xs text-slate-500">-12h</div>
        <div className="text-xs text-slate-500">-6h</div>
        <div className="text-xs text-slate-500">Now</div>
      </div>
    </div>
  )
}

function AgentActivityRow({
  id,
  name,
  target,
  metric1,
  metric2,
  status,
}: { id: string; name: string; target: string; metric1: number; metric2: number; status: string }) {
  return (
    <div className="grid grid-cols-12 py-2 px-3 text-sm hover:bg-white/10 hover:backdrop-blur-sm transition-colors duration-200">
      <div className="col-span-1 text-slate-500 truncate" title={id}>
        {id}
      </div>
      <div className="col-span-4 text-slate-300 truncate" title={name}>
        {name}
      </div>
      <div className="col-span-2 text-slate-400 truncate" title={target}>
        {target}
      </div>
      <div className="col-span-2 text-cyan-400">{metric1.toFixed(1)}%</div>
      <div className="col-span-2 text-purple-400">{metric2.toFixed(1)}s</div>
      <div className="col-span-1">
        <CyberBadge
          variant={
            status === "Running" ? "success" : status === "Idle" ? "neutral" : status === "Queued" ? "info" : "error"
          }
        >
          {status}
        </CyberBadge>
      </div>
    </div>
  )
}

function DataMetricItem({
  name,
  total,
  used,
  unit,
  usageLabel = "Used",
  type,
}: { name: string; total: number; used: number; unit: string; usageLabel?: string; type: string }) {
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0
  return (
    <div className="bg-white/10 rounded-md p-3 border border-white/10 backdrop-blur-md shadow-inner">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-300">{name}</div>
        <CyberBadge variant="neutral" size="sm">
          {type}
        </CyberBadge>
      </div>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-slate-500">
            {usageLabel}: {used.toLocaleString()} {unit}
          </div>
          <div className="text-xs text-slate-400">{percentage}% Full</div>
        </div>
        <Progress value={percentage} className="h-1.5 bg-slate-700">
          <div
            className={`h-full rounded-full ${
              percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-amber-500" : "bg-cyan-500"
            } w-[${percentage}%]`}
          />
        </Progress>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="text-slate-500">
          Capacity: {total.toLocaleString()} {unit}
        </div>
        <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-slate-400 hover:text-slate-100">
          Details
        </Button>
      </div>
    </div>
  )
}

function AlertItem({
  title,
  time,
  description,
  type,
  iconOverride: IconOverride,
}: {
  title: string;
  time: string;
  description: string;
  type: "info" | "warning" | "error" | "success" | "update";
  iconOverride?: LucideIcon;
}) {
  const getTypeStyles = () => {
    switch (type) {
      case "info":
        return { icon: InfoIcon, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" };
      case "warning":
        return { icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" };
      case "error":
        return { icon: AlertTriangle, color: "text-red-500 bg-red-500/10 border-red-500/30" };
      case "success":
        return { icon: CheckCircleIcon, color: "text-green-500 bg-green-500/10 border-green-500/30" };
      case "update":
        return { icon: Download, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30" };
      default:
        return { icon: InfoIcon, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" };
    }
  };
  const { icon: DefaultIcon, color } = getTypeStyles();
  const Icon = IconOverride || DefaultIcon;

  return (
    <div className="flex items-start space-x-3 py-1 px-2 rounded-md hover:bg-white/10 transition-colors duration-200">
      <div className={`mt-0.5 p-1 rounded-full border ${color}`}>
        <Icon className={`h-3 w-3`} />
      </div>
      <div>
        <div className="flex items-center">
          <div className="text-sm font-medium text-slate-200">{title}</div>
          <div className="ml-2 text-xs text-slate-500">{time}</div>
        </div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
    </div>
  );
}

function CommunicationItem({
  sender,
  time,
  message,
  avatar,
  unread,
}: { sender: string; time: string; message: string; avatar: string; unread?: boolean }) {
  const senderInitials = sender
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      className={`
        flex space-x-3 p-2 rounded-md transition-colors duration-200
        ${unread ? "bg-white/10 border border-white/10 backdrop-blur-md" : "hover:bg-white/10"}
      `}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} alt={sender} />
        <AvatarFallback className="bg-slate-700 text-cyan-500">{senderInitials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-200">{sender}</div>
          <div className="text-xs text-slate-500">{time}</div>
        </div>
        <div className="text-xs text-slate-400 mt-1">{message}</div>
      </div>
      {unread && (
        <div className="flex-shrink-0 self-center">
          <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
        </div>
      )}
    </div>
  )
}

function ActionButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <Button
      variant="outline"
      className="h-auto py-3 px-3 border-white/10 bg-white/10 
        hover:bg-white/20 hover:border-white/20 
        flex flex-col items-center justify-center space-y-1 w-full
        backdrop-blur-md transition duration-200"
    >
      <Icon className="h-5 w-5 text-cyan-400" />
      <span className="text-xs text-white font-medium">{label}</span>
    </Button>
  )
}

function CyberBadge({
  children,
  variant = "neutral",
  size = "default",
}: {
  children: React.ReactNode
  variant?: "success" | "warning" | "error" | "info" | "neutral" | "live"
  size?: "default" | "sm"
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-500/50 text-green-400 shadow-[inset_0_0_10px_rgba(34,197,94,0.25),0_0_5px_rgba(34,197,94,0.2)] [text-shadow:0_0_5px_rgba(34,197,94,0.7)] after:from-green-500/20 after:via-green-500/5"
      case "warning":
        return "border-amber-500/50 text-amber-400 shadow-[inset_0_0_10px_rgba(245,158,11,0.25),0_0_5px_rgba(245,158,11,0.2)] [text-shadow:0_0_5px_rgba(245,158,11,0.7)] after:from-amber-500/20 after:via-amber-500/5"
      case "error":
        return "border-red-500/50 text-red-400 shadow-[inset_0_0_10px_rgba(239,68,68,0.25),0_0_5px_rgba(239,68,68,0.2)] [text-shadow:0_0_5px_rgba(239,68,68,0.7)] after:from-red-500/20 after:via-red-500/5"
      case "info":
        return "border-blue-500/50 text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.25),0_0_5px_rgba(59,130,246,0.2)] [text-shadow:0_0_5px_rgba(59,130,246,0.7)] after:from-blue-500/20 after:via-blue-500/5"
      case "live":
        return "border-cyan-500/50 text-cyan-400 shadow-[inset_0_0_10px_rgba(34,211,238,0.25),0_0_5px_rgba(34,211,238,0.2)] [text-shadow:0_0_5px_rgba(34,211,238,0.7)] after:from-cyan-500/20 after:via-cyan-500/5"
      default:
        return "border-slate-600/50 text-slate-300 shadow-[inset_0_0_10px_rgba(148,163,184,0.15),0_0_5px_rgba(148,163,184,0.1)] [text-shadow:0_0_5px_rgba(148,163,184,0.4)] after:from-slate-400/10 after:via-slate-400/5"
    }
  }

  const getSizeStyles = () => {
    return size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"
  }

  return (
    <span
      className={`
      inline-flex items-center justify-center 
      ${getSizeStyles()}
      font-medium tracking-wider
      rounded-md border 
      bg-gradient-to-b from-slate-800 to-slate-900
      ${getVariantStyles()}
      backdrop-blur-sm
      relative overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-t before:from-transparent before:via-white/5 before:to-transparent before:opacity-40
      after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_50%,var(--tw-gradient-from),var(--tw-gradient-via),transparent_70%)] after:opacity-30
      [&>*]:relative
      animate-pulse-less
    `}
    >
      {children}
      <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_45%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.1)_55%,transparent_100%)] opacity-0 animate-[shine_3s_ease-in-out_infinite]"></span>
      <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(255,255,255,0.05)_1px,rgba(255,255,255,0.05)_2px)] opacity-10"></span>
    </span>
  )
}

// Main Dashboard component that uses Suspense for useSearchParams
export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}> {/* Or a more styled loader */}
      <DashboardContent />
    </Suspense>
  );
}
