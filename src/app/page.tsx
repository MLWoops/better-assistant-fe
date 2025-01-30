'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axiosInstance from '@/lib/utils';


type Project = {
  id: string
  title: string
}

type ProjectResponse = {
  _id: string
  project_title: string
  updated_at: string
}

export default function Home() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [inputProjectTitle, setInputProjectTitle] = useState('')


  useEffect(() => {
    axiosInstance.get('/projects').then((response) => {
      const newProjectList: Project[] = []
      response.data.projects.map((project: ProjectResponse) => {
        newProjectList.push({ title: project.project_title, id: project._id })
      })
      setProjects(newProjectList)
    })
  }, [])

  useEffect(() => {
  }, [projects])

  const handleCreateProject = () => {
    axiosInstance.post('/project', {
      project_title: inputProjectTitle
    }).then((response) => {
      const newProjectList: Project[] = projects
      newProjectList.push({ title: inputProjectTitle, id: response.data.project_id })
      setProjects(newProjectList)
      return response
    }).then((response) => {
      router.push(`/project/${response.data.project_id}`);
    })
  }

  return (
    <div className="flex flex-col flex-grow relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2r">
        <div className="bg-background p-4 rounded-lg w-80">
          <h2 className="text-xl font-bold mb-4">Create New Project</h2>
          <Input
            placeholder="Enter project title..."
            className="mb-4"
            value={inputProjectTitle}
            onChange={(e) => setInputProjectTitle(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => handleCreateProject()}
            >
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
