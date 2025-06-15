<?php

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Psr\Log\LoggerInterface;

class AuthenticationSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    private $jwtManager;
    private $urlGenerator;
    private $logger;

    public function __construct(
        JWTTokenManagerInterface $jwtManager, 
        UrlGeneratorInterface $urlGenerator,
        LoggerInterface $logger
    ) {
        $this->jwtManager = $jwtManager;
        $this->urlGenerator = $urlGenerator;
        $this->logger = $logger;
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): Response
    {
        try {
            $user = $token->getUser();
            $this->logger->info('User authenticated successfully', [
                'email' => $user->getEmail(),
                'roles' => $user->getRoles()
            ]);
            
            $jwt = $this->jwtManager->create($user);
            $this->logger->info('JWT token generated successfully');

            $redirectUrl = $this->urlGenerator->generate('profile', [], UrlGeneratorInterface::ABSOLUTE_URL);
            $this->logger->info('Redirect URL generated', ['url' => $redirectUrl]);

            if ($request->headers->get('Accept') === 'application/json' || 
                $request->headers->get('Content-Type') === 'application/json') {
                return new JsonResponse([
                    'token' => $jwt,
                    'redirect' => $redirectUrl,
                    'user' => [
                        'email' => $user->getEmail(),
                        'roles' => $user->getRoles()
                    ]
                ]);
            }

            return new Response('', Response::HTTP_FOUND, [
                'Location' => $redirectUrl
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error during authentication success', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->headers->get('Accept') === 'application/json' || 
                $request->headers->get('Content-Type') === 'application/json') {
                return new JsonResponse([
                    'error' => 'Une erreur est survenue lors de l\'authentification',
                    'details' => $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return new Response('', Response::HTTP_FOUND, [
                'Location' => $this->urlGenerator->generate('app_login', [], UrlGeneratorInterface::ABSOLUTE_URL)
            ]);
        }
    }
} 