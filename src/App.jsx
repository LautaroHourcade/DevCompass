import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import RepoDetailModal from './components/repos/RepoDetailModal'
import PageLoader from './components/ui/PageLoader'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/RouteGuards'
import ExploreView from './views/ExploreView'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { useSavedRepos } from './hooks/useSavedRepos'
import { useLists } from './hooks/useLists'
import { useTags } from './hooks/useTags'
import { useToast } from './hooks/useToast'
import { signOut } from './services/authService'

// Explorar se carga siempre; el resto de pantallas se descargan solo cuando se visitan.
const SavedView = lazy(() => import('./views/SavedView'))
const ListsView = lazy(() => import('./views/ListsView'))
const ListDetailView = lazy(() => import('./views/ListDetailView'))
const TagsView = lazy(() => import('./views/TagsView'))
const DashboardView = lazy(() => import('./views/DashboardView'))
const CompareView = lazy(() => import('./views/CompareView'))
const LoginView = lazy(() => import('./views/LoginView'))
const RegisterView = lazy(() => import('./views/RegisterView'))
const ProfileView = lazy(() => import('./views/ProfileView'))
const NotFoundView = lazy(() => import('./views/NotFoundView'))

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const {
    savedRepos,
    isLoading: isLoadingSaved,
    loadError: savedLoadError,
    reload: reloadSaved,
    isSaved,
    toggleSave,
    forgetTag,
    ...tracking
  } = useSavedRepos(user?.id)
  const listsState = useLists(user?.id)
  const tagsState = useTags(user?.id)
  const { refresh: refreshLists } = listsState
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedRepo, setSelectedRepo] = useState(null)

  const isExploreRoute = location.pathname === '/'

  // Cada cambio de página empieza arriba.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Recarga las listas tras un cambio que las afecta en la base de datos (cascade).
  const refreshListsSafely = useCallback(() => {
    refreshLists().catch(() => showToast('No se pudieron actualizar tus listas', 'error'))
  }, [refreshLists, showToast])

  const handleToggleSave = useCallback(
    async (repo) => {
      // Sin sesión no se puede guardar: invitamos a entrar y volvemos aquí después.
      if (!user) {
        setSelectedRepo(null)
        showToast('Inicia sesión para guardar repositorios', 'info')
        navigate('/entrar', { state: { from: location.pathname } })
        return
      }

      try {
        const isNowSaved = await toggleSave(repo)
        if (isNowSaved) {
          showToast(`"${repo.name}" añadido a guardados`, 'success')
        } else {
          // Al quitarlo de guardados también sale de sus listas (cascade en la base de datos).
          refreshListsSafely()
          showToast(`"${repo.name}" eliminado de guardados`, 'info')
        }
      } catch (error) {
        showToast(error.message, 'error')
      }
    },
    [user, toggleSave, refreshListsSafely, showToast, navigate, location.pathname],
  )

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      navigate('/')
      showToast('Has cerrado sesión', 'info')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }, [navigate, showToast])

  const handleCloseDetail = useCallback(() => setSelectedRepo(null), [])

  // Al eliminar una etiqueta, la base de datos ya quitó sus asociaciones: recargamos lo que se ve.
  const handleTagDeleted = useCallback(
    (tagId) => {
      forgetTag(tagId)
      refreshListsSafely()
    },
    [forgetTag, refreshListsSafely],
  )

  // Lo que necesitan las pantallas que solo leen la colección (Panel y Comparar).
  const collectionProps = {
    savedRepos,
    isLoading: isLoadingSaved,
    savedLoadError,
    onReloadSaved: reloadSaved,
    onOpenDetail: setSelectedRepo,
  }

  const repoGridProps = {
    savedRepos,
    savedLoadError,
    onReloadSaved: reloadSaved,
    isSaved,
    onToggleSave: handleToggleSave,
    onOpenDetail: setSelectedRepo,
    listsState,
    tagsState,
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Saltar al contenido
      </a>

      <Header
        user={user}
        savedCount={savedRepos.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={handleSignOut}
      />

      <main id="main" className="mx-auto min-h-[calc(100vh-14rem)] max-w-page overflow-x-clip px-4 py-8 sm:px-6 sm:py-12">
        {/* Explorar se oculta en lugar de desmontarse para conservar la búsqueda */}
        <div hidden={!isExploreRoute}>
          <ExploreView isSaved={isSaved} onToggleSave={handleToggleSave} onOpenDetail={setSelectedRepo} />
        </div>

        <Suspense fallback={<PageLoader label="Cargando…" />}>
          <Routes>
            <Route path="/" element={null} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/entrar" element={<LoginView />} />
              <Route path="/registro" element={<RegisterView />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/panel" element={<DashboardView {...collectionProps} />} />
              <Route path="/comparar" element={<CompareView {...collectionProps} />} />
              <Route
                path="/guardados"
                element={
                  <SavedView isLoading={isLoadingSaved} tracking={tracking} {...repoGridProps} />
                }
              />
              <Route path="/listas" element={<ListsView listsState={listsState} tagsState={tagsState} />} />
              <Route
                path="/listas/:listId"
                element={<ListDetailView isLoadingSaved={isLoadingSaved} {...repoGridProps} />}
              />
              <Route
                path="/etiquetas"
                element={
                  <TagsView
                    tagsState={tagsState}
                    savedRepos={savedRepos}
                    lists={listsState.lists}
                    onTagDeleted={handleTagDeleted}
                  />
                }
              />
              <Route path="/perfil" element={<ProfileView />} />
            </Route>

            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </Suspense>
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
