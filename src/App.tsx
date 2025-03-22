import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import {GameAnalytics} from "gameanalytics";
import {useEffect} from "react";

const queryClient = new QueryClient();


const App = () => {

    useEffect(() => {
        GameAnalytics.setEnabledInfoLog(true);
        GameAnalytics.setEnabledVerboseLog(true);
        GameAnalytics.configureBuild('0.1.0');
        GameAnalytics.initialize('51974020a101bcc78622c14444713bc9', '83c228a69c2164e87c985610d6617a962a795e40')
        GameAnalytics.startSession()
   }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster/>
                <Sonner/>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index/>}/>
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    )
};

export default App;
