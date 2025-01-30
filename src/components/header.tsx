'use client'

import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import React from 'react';

export default function Header() {
    return (
        <header className="flex items-center justify-between p-4 border-b bg-muted">
            <h1 className="text-2xl font-bold">Chatbot</h1>
            <Button variant="ghost" size="icon" aria-label="User profile">
                <User className="h-5 w-5" />
            </Button>
        </header>
    )
}

