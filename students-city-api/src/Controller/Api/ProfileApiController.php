<?php
namespace App\Controller\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ProfileApiController extends AbstractController
{
    private $logger;
    private $entityManager;

    public function __construct(LoggerInterface $logger, EntityManagerInterface $entityManager)
    {
        $this->logger = $logger;
        $this->entityManager = $entityManager;
    }

    #[Route('/api/profile/{id}', name: 'api_profile_update_by_id', methods: ['PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function updateProfileById(
        int $id,
        Request $request,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        try {
            /** @var User $currentUser */
            $currentUser = $this->getUser();
            
            if (!$currentUser) {
                $this->logger->error('Utilisateur non trouvé dans la requête');
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], JsonResponse::HTTP_UNAUTHORIZED);
            }

            // Vérifier que l'utilisateur modifie son propre profil
            if ($currentUser->getId() !== $id) {
                $this->logger->error('Tentative de modification d\'un autre profil', [
                    'user_id' => $currentUser->getId(),
                    'target_id' => $id
                ]);
                return $this->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez modifier que votre propre profil'
                ], JsonResponse::HTTP_FORBIDDEN);
            }

            $user = $this->entityManager->getRepository(User::class)->find($id);
            
            if (!$user) {
                $this->logger->error('Utilisateur non trouvé', ['id' => $id]);
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], JsonResponse::HTTP_NOT_FOUND);
            }

            $data = json_decode($request->getContent(), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->logger->error('Données JSON invalides', ['error' => json_last_error_msg()]);
                return $this->json([
                    'success' => false,
                    'message' => 'Données JSON invalides'
                ], JsonResponse::HTTP_BAD_REQUEST);
            }

            if (isset($data['pseudo'])) {
                $user->setPseudo($data['pseudo']);
            }
            if (isset($data['email'])) {
                $user->setEmail($data['email']);
            }
            if (!empty($data['plainPassword'])) {
                $user->setPassword($passwordHasher->hashPassword($user, $data['plainPassword']));
            }

            $this->entityManager->flush();
            
            $this->logger->info('Profil mis à jour avec succès', [
                'user_id' => $user->getId(),
                'email' => $user->getEmail()
            ]);

            return $this->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'pseudo' => $user->getPseudo(),
                    'email' => $user->getEmail(),
                ]
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la mise à jour du profil', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour du profil'
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/profile', name: 'api_profile_get', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getProfile(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'pseudo' => $user->getPseudo(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'status' => $user->getStatus()
        ]);
    }

    #[Route('/api/profile', name: 'api_profile_update', methods: ['PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['pseudo']) || !isset($data['email'])) {
            return new JsonResponse(['error' => 'Pseudo et email sont requis'], 400);
        }

        $pseudo = trim($data['pseudo']);
        $email = trim($data['email']);

        if (empty($pseudo) || empty($email)) {
            return new JsonResponse(['error' => 'Pseudo et email ne peuvent pas être vides'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Format d\'email invalide'], 400);
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existingUser && $existingUser->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Cet email est déjà utilisé par un autre utilisateur'], 400);
        }

        // Mettre à jour les informations
        $user->setPseudo($pseudo);
        $user->setEmail($email);

        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'id' => $user->getId(),
                'pseudo' => $user->getPseudo(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'status' => $user->getStatus()
            ]
        ]);
    }
}
