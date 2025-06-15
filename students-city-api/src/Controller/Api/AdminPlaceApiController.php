<?php
// src/Controller/Api/AdminPlaceApiController.php

namespace App\Controller\Api;

use App\Entity\Place;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class AdminPlaceApiController extends AbstractController
{
    #[Route('/api/admin/places/{id}/approve', name: 'api_admin_place_approve', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function approve(int $id, EntityManagerInterface $em): JsonResponse
    {
        $place = $em->getRepository(Place::class)->find($id);
        if (!$place) return $this->json(['success' => false, 'message' => 'Établissement non trouvé'], 404);
        
        $place->setStatut('validé');
        $em->flush();
        
        return $this->json(['success' => true]);
    }

    #[Route('/api/admin/places/{id}/revoke', name: 'api_admin_place_revoke', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function revoke(int $id, EntityManagerInterface $em): JsonResponse
    {
        $place = $em->getRepository(Place::class)->find($id);
        if (!$place) return $this->json(['success' => false, 'message' => 'Établissement non trouvé'], 404);
        
        $place->setStatut('en attente');
        $em->flush();
        
        return $this->json(['success' => true]);
    }
}