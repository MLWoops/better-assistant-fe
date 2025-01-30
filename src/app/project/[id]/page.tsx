
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Plus, Save, SendIcon, Trash } from 'lucide-react';
import axiosInstance from '@/lib/utils';


type Dialog = {
  _id: string
  dialog_title: string
  update_at: string
}
type Prompt = {
  _id: string
  prompt_content: string
  prompt_version: string
  update_at: string
}
type ProjectDetail = {
  project_title: string
  prompts: Prompt[]
  dialogs: Dialog[]
  updated_at: string
}

const ProjectPage = () => {
  const router = useRouter()
  const params = useParams() ?? { id: '' };
  const projectId = params.id;
  const [project, setProject] = useState<ProjectDetail>({ project_title: '', prompts: [], dialogs: [], updated_at: '' });
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [projectInputMessage, setProjectInputMessage] = useState('');
  const [promptInputMessage, setPromptInputMessage] = useState('');
  const [versionInputMessage, setVersionInputMessage] = useState('');
  const [dialogInputMessage, setDialogInputMessage] = useState('');
  const [, forceRender] = useState(0);

  useEffect(() => {
    axiosInstance.get(`/project?projectId=${projectId}`).then((response) => {
      setProject(response.data.project_detail);
      return response;
    }).then((response) => {
      const projectDetail: ProjectDetail = response.data.project_detail;
      if (projectDetail.project_title) {
        setProjectInputMessage(projectDetail.project_title);
      }
      if (projectDetail.prompts.length > 0) {
        setVersionInputMessage(projectDetail.prompts[0].prompt_version);
        setPromptInputMessage(projectDetail.prompts[0].prompt_content);
      }
      if (projectDetail.dialogs.length > 0) {
        setDialogInputMessage(projectDetail.dialogs[0].dialog_title);
      }
    }
    )
  }, [projectId]);

  useEffect(() => {
    if (project.prompts.length > currentPromptIndex) {
      setVersionInputMessage(project.prompts[currentPromptIndex]?.prompt_version);
      setPromptInputMessage(project.prompts[currentPromptIndex]?.prompt_content);
    }
    else {
      setVersionInputMessage('');
      setPromptInputMessage('');
    }
  }, [currentPromptIndex]);

  useEffect(() => {
    if (project.dialogs.length > currentDialogIndex) {
      setDialogInputMessage(project.dialogs[currentDialogIndex]?.dialog_title);
    }
    else {
      setDialogInputMessage('');
    }
  }, [currentDialogIndex]);

  const handlePromptIndexChangePlus = () => {
    if (currentPromptIndex < project.prompts.length) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    }
  }

  const handlePromptIndexChangeMinus = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
    }
  }

  const handleDialogIndexChangePlus = () => {
    if (currentDialogIndex < project.dialogs.length) {
      setCurrentDialogIndex(currentDialogIndex + 1);
    }
  }

  const handleDialogIndexChangeMinus = () => {
    if (currentDialogIndex > 0) {
      setCurrentDialogIndex(currentDialogIndex - 1);
    }
  }
  const handleUpdateProject = () => {
    axiosInstance.put(`/project?projectId=${projectId}`, {
      project_title: projectInputMessage
    }).then(() => {
      const newProject = project;
      newProject.project_title = projectInputMessage;
      setProject(newProject);
    })
  };

  const handleDeleteProject = () => {
    axiosInstance.delete(`/project?projectId=${projectId}`).then(() => {
      router.push(`/`);
    }
    )
  };

  const handleCreatePrompt = () => {
    axiosInstance.post('/prompt', {
      project_id: projectId,
      prompt_version: versionInputMessage,
      prompt_content: promptInputMessage
    }).then((response) => {
      const newProject: ProjectDetail = project;
      newProject.prompts.push({ _id: response.data.prompt_id, prompt_version: versionInputMessage, prompt_content: promptInputMessage, update_at: new Date().toISOString() });
      setProject(newProject);
    }).then(() => {
      forceRender((prev) => prev + 1);
    })
  };

  const handleUpdatePrompt = () => {
    axiosInstance.post(`/prompt?promptId=${project.prompts[currentPromptIndex]._id}`, {
      project_id: projectId,
      prompt_version: versionInputMessage,
      prompt_content: promptInputMessage
    }).then(() => {
      const newProject = project;
      newProject.prompts[currentPromptIndex].prompt_version = versionInputMessage;
      newProject.prompts[currentPromptIndex].prompt_content = promptInputMessage;
      setProject(newProject);
    }).then(() => {
      forceRender((prev) => prev + 1);
    })
  };

  const handleDeletePrompt = () => {
    axiosInstance.delete(`/prompt?promptId=${project.prompts[currentPromptIndex]._id}`).then(() => {
      const newProject = project;
      newProject.prompts.splice(currentPromptIndex, 1);
      setProject(newProject);
      return newProject;
    }).then((newProject) => {
      if (currentPromptIndex > newProject.prompts.length - 1) {
        setPromptInputMessage('');
        setVersionInputMessage('');
      }
      else {
        setPromptInputMessage(newProject.prompts[currentPromptIndex].prompt_content);
        setVersionInputMessage(newProject.prompts[currentPromptIndex].prompt_version);
      }
      forceRender((prev) => prev + 1);
    })
  };

  const handleCreateDialog = () => {
    axiosInstance.post(`/dialog`, {
      project_id: projectId,
      dialog_title: dialogInputMessage,
      dialog_content: []
    }).then((response) => {
      const newProject: ProjectDetail = project;
      newProject.dialogs.push({ _id: response.data.dialog_id, dialog_title: dialogInputMessage, update_at: new Date().toISOString() });
      setProject(newProject);
      return newProject;
    }).then(() => {
      forceRender((prev) => prev + 1);
    })
  };

  const handleUpdateDialog = () => {
    axiosInstance.post(`/dialog?dialogId=${project.dialogs[currentDialogIndex]._id}`, {
      project_id: projectId,
      dialog_title: dialogInputMessage,
      dialog_content: []
    }).then(() => {
      const newProject = project;
      newProject.dialogs[currentDialogIndex].dialog_title = dialogInputMessage;
      setProject(newProject);
    }).then(() => {
      forceRender((prev) => prev + 1);
    })
  };

  const handleDeleteDialog = () => {
    axiosInstance.delete(`/dialog?dialogId=${project.dialogs[currentDialogIndex]._id}`).then(() => {
      const newProject = project;
      newProject.dialogs.splice(currentDialogIndex, 1);
      setProject(newProject);
      return newProject;
    }).then((newProject) => {
      if (currentDialogIndex > newProject.dialogs.length - 1) {
        setDialogInputMessage('');
      }
      else {
        setDialogInputMessage(newProject.dialogs[currentDialogIndex].dialog_title);
      }
      forceRender((prev) => prev + 1);
    })
  };

  const handleStartDialog = () => {
    router.push(`/chat/${projectId}/${project.dialogs[currentDialogIndex]._id}/${project.prompts[currentPromptIndex]._id}`);
  };

  return (
    <div className="flex flex-col flex-grow relative">
      <div className="flex items-center justify-center">
        <h2 className="p-6 gap-6 text-2xl font-bold">{project.project_title}</h2>
      </div>
      <div className="flex items-center justify-center">
        <div className="min-w-[600px] max-w-[600px] p-6 gap-6">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter project title..."
                    value={projectInputMessage}
                    onChange={(e) => setProjectInputMessage(e.target.value)}
                  />
                </div>
                <Button className="w-full" size="lg"
                  onClick={handleUpdateProject}
                  disabled={projectInputMessage === ''}>
                  <Save className="mr-2 h-4 w-4" />
                  Update Project
                </Button>
                <Button className="w-full bg-red-500" size="lg"
                  onClick={handleDeleteProject}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div >
      </div >
      <div className="flex items-center justify-center">
        <div className="min-w-[600px] max-w-[600px] p-6 gap-6">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prompts</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handlePromptIndexChangeMinus}
                    disabled={currentPromptIndex === 0}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Previous prompt</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={handlePromptIndexChangePlus}
                    disabled={currentPromptIndex === project.prompts.length}>
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">Next prompt</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter version..."
                    value={versionInputMessage}
                    onChange={(e) => setVersionInputMessage(e.target.value)}
                  />
                  <Input
                    placeholder="Enter prompt..."
                    value={promptInputMessage}
                    onChange={(e) => setPromptInputMessage(e.target.value)}
                  />
                </div>
                {currentPromptIndex < project.prompts.length ? (
                  <Button className="w-full" size="lg"
                    onClick={handleUpdatePrompt}
                    disabled={promptInputMessage === '' || versionInputMessage === ''}>
                    <Save className="mr-2 h-4 w-4" />
                    Update Prompt
                  </Button>
                ) : (
                  <Button className="w-full" size="lg"
                    onClick={handleCreatePrompt}
                    disabled={promptInputMessage === '' || versionInputMessage === ''}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Prompt
                  </Button>
                )}
                <Button className="w-full bg-red-500" size="lg"
                  onClick={handleDeletePrompt}
                  disabled={currentPromptIndex >= project.prompts.length}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Prompt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div >
      </div >
      <div className="flex items-center justify-center">
        <div className="min-w-[600px] max-w-[600px] p-6 gap-6">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chats</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handleDialogIndexChangeMinus}
                    disabled={currentDialogIndex === 0}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Previous chat</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleDialogIndexChangePlus}
                    disabled={currentDialogIndex === project.dialogs.length}>
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">Next chat</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter chat title..."
                    value={dialogInputMessage}
                    onChange={(e) => setDialogInputMessage(e.target.value)}
                  />
                </div>
                {currentDialogIndex < project.dialogs.length ? (
                  <Button className="w-full" size="lg" onClick={handleUpdateDialog}
                    disabled={dialogInputMessage === ''}>
                    <Save className="mr-2 h-4 w-4" />
                    Update Chat
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" onClick={handleCreateDialog}
                    disabled={dialogInputMessage === ''}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Chat
                  </Button>
                )}
                <Button className="w-full" size="lg"
                  disabled={currentDialogIndex >= project.dialogs.length || currentPromptIndex >= project.prompts.length}
                  onClick={handleStartDialog}>
                  <SendIcon className="mr-2 h-4 w-4" />
                  Start Chat
                </Button>
                <Button className="w-full bg-red-500" size="lg"
                  onClick={handleDeleteDialog}
                  disabled={currentDialogIndex >= project.dialogs.length}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div >
      </div >
    </div >
  );
};

export default ProjectPage;