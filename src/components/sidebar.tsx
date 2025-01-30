'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, MessageSquare, Settings, HelpCircle, FilesIcon, PlusIcon } from "lucide-react"
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

export default function SideBar() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [inputProjectTitle, setInputProjectTitle] = useState('')
  const [, forceRender] = useState(0)

  useEffect(() => {
    axiosInstance.get('/projects').then((response) => {
      const newProjectList: Project[] = []
      response.data.projects.map((project: ProjectResponse) => {
        newProjectList.push({ title: project.project_title, id: project._id })
      })
      setProjects(newProjectList)
    }).catch((error) => {
      if (error.response.status === 404) {
        setProjects([])
      }
    })
  }, [])

  useEffect(() => {
  }, [projects])

  const handleCreateProjectClick = () => {
    setModalOpen(true)
  }

  const handleCreateProject = () => {
    axiosInstance.post('/project', {
      project_title: inputProjectTitle
    }).then((response) => {
      const newProjectList: Project[] = projects
      newProjectList.push({ title: inputProjectTitle, id: response.data.project_id })
      setProjects(newProjectList)
      return response;
    }).then((response) => {
      router.push(`/project/${response.data.project_id}`);
      forceRender((prev) => prev + 1);
    })
    setModalOpen(false)
  }

  const handleProjectClick = (project: Project) => {
    router.push(`/project/${project.id}`);
    forceRender((prev) => prev + 1);
  }

  return (
    <div className={`bg-muted transition-all duration-300 ease-in-out ${isMenuOpen ? 'w-64' : 'w-16'}`}>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
                variant="ghost"
                className="mr-2"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCreateProject()}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full p-4">
        <Button
          variant="ghost"
          className={`flex items-center ${isMenuOpen ? 'justify-start' : 'justify-center'} w-full mb-4`}
          aria-label={isMenuOpen ? "Collapse menu" : "Expand menu"}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5 flex-shrink-0" />
          {isMenuOpen && <span className="ml-2">Menu</span>}
        </Button>
        <div className="relative">
          <div>
            <Button
              variant="ghost"
              className={`flex items-center ${isMenuOpen ? 'justify-start' : 'justify-center'} w-full mb-2`}
              aria-label="CreateProject"
              aria-expanded={isMenuOpen}
              onClick={handleCreateProjectClick}
            >
              <FilesIcon className="h-5 w-5 flex-shrink-0" />
              {isMenuOpen && (
                <>
                  <span className="ml-2 flex-grow text-left">New Project</span>
                  <PlusIcon className="h-5 w-5 flex-shrink-0" />
                </>
              )}
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="relative">
            {projects.map((project) => (
              <Button
                variant="ghost"
                className={`flex items-center ${isMenuOpen ? 'justify-start' : 'justify-center'} w-full mb-2`}
                aria-label="project"
                aria-expanded={isMenuOpen}
                onClick={() => handleProjectClick(project)}
                key={project.id}
              >
                <MessageSquare className="h-5 w-5 flex-shrink-0" />
                <span className="ml-2 flex-grow text-left">{project.title}</span>
              </Button>
            ))}
          </div>
        )}
        <Button
          variant="ghost"
          className={`flex items-center ${isMenuOpen ? 'justify-start' : 'justify-center'} w-full mb-2`}
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {isMenuOpen && <span className="ml-2">Settings</span>}
        </Button>
        <Button
          variant="ghost"
          className={`flex items-center ${isMenuOpen ? 'justify-start' : 'justify-center'} w-full mt-auto`}
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5 flex-shrink-0" />
          {isMenuOpen && <span className="ml-2">Help</span>}
        </Button>
      </div>
    </div>
  )
}