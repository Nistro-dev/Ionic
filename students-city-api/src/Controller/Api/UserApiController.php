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

class UserApiController extends AbstractController
{
    private $logger;
    private $entityManager;

    public function __construct(LoggerInterface $logger, EntityManagerInterface $entityManager)
    {
        $this->logger = $logger;
        $this->entityManager = $entityManager;
    }

    #[Route('/api/users/{id}', name: 'api_user_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateUser(
        int $id,
        Request $request,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        try {
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
            if (isset($data['roles'])) {
                $user->setRoles($data['roles']);
            }
            if (isset($data['status'])) {
                $user->setStatus($data['status']);
            }

            $this->entityManager->flush();
            
            $this->logger->info('Utilisateur mis à jour avec succès', [
                'user_id' => $user->getId(),
                'email' => $user->getEmail()
            ]);

            return $this->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'pseudo' => $user->getPseudo(),
                    'email' => $user->getEmail(),
                    'roles' => $user->getRoles(),
                    'status' => $user->getStatus()
                ]
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la mise à jour de l\'utilisateur', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour de l\'utilisateur'
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/users', name: 'api_users_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listUsers(): JsonResponse
    {
        try {
            $users = $this->entityManager->getRepository(User::class)->findAll();
            $usersData = [];
            
            foreach ($users as $user) {
                $usersData[] = [
                    'id' => $user->getId(),
                    'pseudo' => $user->getPseudo(),
                    'email' => $user->getEmail(),
                    'roles' => $user->getRoles(),
                    'status' => $user->getStatus(),
                    'createAt' => $user->getCreateAt()->format('Y-m-d H:i:s')
                ];
            }
            
            return $this->json([
                'success' => true,
                'users' => $usersData
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la récupération des utilisateurs', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération des utilisateurs'
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 