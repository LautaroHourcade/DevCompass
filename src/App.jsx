import { useCallback, useState } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import RepoDetailModal from './components/repos/RepoDetailModal'
import ExploreView from './views/ExploreView'
import SavedView from './views/SavedView'
import { useTheme } from './hooks/useTheme'
import { useSavedRepos } from './hooks/useSavedRepos'
import { useToast } from './hooks/useToast'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { savedRepos, isSaved, toggleSave } = useSavedRepos()
  const { showToast } = useToast()
  const [activeView, setActiveView] = useState('explore')
  const [selectedRepo, setSelectedRepo] = useState(null)

  const handleToggleSave = useCallback(
    async (repo) => {
      try {
        const isNowSaved = await toggleSave(repo)
        if (isNowSaved) {
          showToast(`"${repo.name}" añadido a guardados`, 'success')
        } else {
          showToast(`"${repo.name}" eliminado de guardados`, 'info')
        }
      } catch (error) {
        showToast(error.message, 'error')
      }
    },
    [toggleSave, showToast],
  )

  const handleChangeView = useCallback((view) => {
    setActiveView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleCloseDetail = useCallback(() => setSelectedRepo(null), [])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Saltar al contenido
      </a>

      <Header
        activeView={activeView}
        onChangeView={handleChangeView}
        savedCount={savedRepos.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main id="main" className="mx-auto min-h-[calc(100vh-14rem)] max-w-page px-4 py-8 sm:px-6 sm:py-12">
        {/* Explorar se oculta en lugar de desmontarse para conservar la búsqueda */}
        <div hidden={activeView !== 'explore'}>
          <ExploreView isSaved={isSaved} onToggleSave={handleToggleSave} onOpenDetail={setSelectedRepo} />
        </div>

        {activeView === 'saved' && (
          <SavedView
            savedRepos={savedRepos}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onOpenDetail={setSelectedRepo}
            onGoExplore={() => handleChangeView('explore')}
          />
        )}
      </main>

      <Footer />

      <RepoDetailModal
        repo={selectedRepo}
        onClose={handleCloseDetail}
        isSaved={isSaved}
        onToggleSave={handleToggleSave}
      />
    </>
  )
}
