"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { sendWelcomeEmail } from "@/lib/email"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { FcGoogle } from 'react-icons/fc';


export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const router = useRouter()
  const { toast } = useToast()
 
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // User is created but might need to confirm email
      if (!data?.user) {
        toast({
          title: "Email confirmation required",
          description: "Please check your email to confirm your account before continuing.",
        });
        return;
      }

      const jwt = data.session?.access_token;
      if (!jwt) {
        toast({
          title: "Almost there!",
          description: "Please check your email to confirm your account before continuing.",
        });
        return;
      }

      // Call Django API to sync user
      await fetch("http://localhost:8000/api/create-user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          supabase_uid: data.user.id,
          email,
          full_name: fullName,
        }),
      });

      toast({
        title: "Success!",
        description: "Account created and synced. Welcome!",
      });

      // Send welcome email
      await sendWelcomeEmail(email, fullName)

      router.push("/"); // Optional: redirect after signup
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to home after successful login
      router.push("/");
    } catch (error: any) {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-none shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold dark:text-white">Welcome to  <span className="text-red-600 dark:text-red-500">HAXEUZ</span></CardTitle>
          <CardDescription className="dark:text-gray-400">Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 dark:bg-gray-700">
              <TabsTrigger value="signin" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="dark:text-gray-300">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-red-500 hover:bg-red-700 text-white" disabled={loading}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full mt-4 bg-white dark:bg-gray-900 text-black dark:text-white flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={loading}>
            
             <FcGoogle size={20} />
               {activeTab === "signup" ? "Sign up with Google" : "Sign in with Google"}
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
