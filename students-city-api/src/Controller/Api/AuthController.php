<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Form\LoginType;
use App\Form\RegistrationType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Doctrine\ORM\EntityManagerInterface;

class AuthController extends AbstractController
{
    private $entityManager;

    // Injection de l'EntityManager dans le constructeur
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request, UserPasswordHasherInterface $passwordHasher, JWTTokenManagerInterface $jwtManager): JsonResponse
    {
        // Récupérer les données JSON de la requête
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Email and password are required.'], 400);
        }

        $email = $data['email'];
        $password = $data['password'];

        // Vérifier si l'utilisateur existe
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            return new JsonResponse(['error' => 'Invalid email or password.'], 401);
        }

        // Vérifier le mot de passe
        if (!$passwordHasher->isPasswordValid($user, $password)) {
            return new JsonResponse(['error' => 'Invalid email or password.'], 401);
        }

        if (empty($user->getRoles())) {
            return new JsonResponse(['error' => 'Votre compte n\'est pas encore validé par un administrateur.'], 403);
        }

        // Générer un token JWT
        $token = $jwtManager->create($user);

        return new JsonResponse(['token' => $token]);
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $hasher): JsonResponse
    {
        $user = new User();
        $form = $this->createForm(RegistrationType::class, $user);

        $form->submit($request->toArray()); // pas handleRequest ici pour l'API

        if (!$form->isSubmitted() || !$form->isValid()) {
            return $this->json(['errors' => (string) $form->getErrors(true, false)], 400);
        }


        // On soumet les données JSON comme un tableau
        $data = json_decode($request->getContent(), true);

        if (!$form->isSubmitted() || !$form->isValid()) {
            $errors = [];
            foreach ($form->getErrors(true) as $error) {
                $errors[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errors], 400);
        }

        // Hashage du mot de passe
        $user->setPassword($hasher->hashPassword($user, $user->getPassword()));
        $user->setRoles([]);
        $user->setStatus('en attente'); 
        $user->setCreateAt(new \DateTimeImmutable());

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'User registered successfully'], 201);
    }
}
