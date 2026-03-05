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
    <div className="min-h-screen flex items-center justify-center bg-theme py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <Card className="w-full max-w-md border border-theme shadow-md bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-theme">Welcome to  <span className="text-[var(--accent)]">HAXEUS</span></CardTitle>
          <CardDescription className="text-theme-2">Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-theme opacity-10">
              <TabsTrigger value="signin" className="text-theme-2 data-[state=active]:bg-theme data-[state=active]:text-theme">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-theme-2 data-[state=active]:bg-theme data-[state=active]:text-theme">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-theme-2">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card border-theme text-theme" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white/60">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-card border-theme text-theme"
                  />
                </div>
                <Button type="submit" className="w-full bg-[var(--accent)] hover:opacity-90 text-white font-bold" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-theme-2">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-card border-theme text-theme"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-theme-2">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card border-theme text-theme" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white/60">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-card border-theme text-theme"
                  />
                </div>
                <Button type="submit" className="w-full bg-[var(--accent)] hover:opacity-90 text-white font-bold" disabled={loading}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-theme" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-theme-2">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full mt-4 bg-card text-theme flex items-center justify-center gap-2 border border-theme shadow-sm hover:bg-theme hover:bg-opacity-5"
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
